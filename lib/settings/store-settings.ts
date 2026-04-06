import {
  GatewayMode,
  PaymentGateway,
  type PaymentMethodSetting,
  type Prisma,
  type StoreSettings,
} from "@/generated/prisma"

import {
  PAYMENT_GATEWAY_LABELS,
  STORE_SETTINGS_SINGLETON_ID,
} from "@/lib/commerce/constants"
import { prisma } from "@/lib/prisma"

function toNumber(value: Prisma.Decimal | number | null | undefined) {
  return value === null || value === undefined ? null : Number(value)
}

function coerceStringArray(value: Prisma.JsonValue | null | undefined) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean)
}

function normalizeStoreSettings(settings: StoreSettings) {
  return {
    ...settings,
    defaultHandlingFee: Number(settings.defaultHandlingFee),
    defaultMapLatitude: toNumber(settings.defaultMapLatitude),
    defaultMapLongitude: toNumber(settings.defaultMapLongitude),
    storeLatitude: toNumber(settings.storeLatitude),
    storeLongitude: toNumber(settings.storeLongitude),
    serviceAreaCountries: coerceStringArray(settings.serviceAreaCountries),
  }
}

function normalizePaymentMethodSetting(setting: PaymentMethodSetting) {
  return {
    ...setting,
    extraFee: Number(setting.extraFee),
    minimumOrderAmount: toNumber(setting.minimumOrderAmount),
    maximumOrderAmount: toNumber(setting.maximumOrderAmount),
    allowedShippingMethodTypes: coerceStringArray(setting.allowedShippingMethodTypes),
    allowedZoneIds: coerceStringArray(setting.allowedZoneIds),
  }
}

function getDefaultPaymentMethodSeed(gateway: PaymentGateway) {
  switch (gateway) {
    case PaymentGateway.STRIPE:
      return {
        gateway,
        displayName: PAYMENT_GATEWAY_LABELS[gateway],
        instructions: "Pay securely with card using Stripe Checkout.",
        isEnabled: false,
        mode: GatewayMode.SANDBOX,
        publicKey: null,
        secretKey: null,
        webhookSecret: null,
        extraFee: 0,
        minimumOrderAmount: null,
        maximumOrderAmount: null,
        allowedShippingMethodTypes: [],
        allowedZoneIds: [],
      } satisfies Prisma.PaymentMethodSettingUncheckedCreateInput
    case PaymentGateway.PAYPAL:
      return {
        gateway,
        displayName: PAYMENT_GATEWAY_LABELS[gateway],
        instructions: "Complete payment on the secure PayPal approval page.",
        isEnabled: false,
        mode: GatewayMode.SANDBOX,
        publicKey: null,
        secretKey: null,
        webhookSecret: null,
        extraFee: 0,
        minimumOrderAmount: null,
        maximumOrderAmount: null,
        allowedShippingMethodTypes: [],
        allowedZoneIds: [],
      } satisfies Prisma.PaymentMethodSettingUncheckedCreateInput
    case PaymentGateway.CASH_ON_DELIVERY:
      return {
        gateway,
        displayName: PAYMENT_GATEWAY_LABELS[gateway],
        instructions: "Pay the courier when your order is delivered.",
        isEnabled: true,
        mode: GatewayMode.SANDBOX,
        publicKey: null,
        secretKey: null,
        webhookSecret: null,
        extraFee: 0,
        minimumOrderAmount: null,
        maximumOrderAmount: null,
        allowedShippingMethodTypes: [],
        allowedZoneIds: [],
      } satisfies Prisma.PaymentMethodSettingUncheckedCreateInput
    default:
      throw new Error(`Unsupported payment gateway: ${gateway}`)
  }
}

export async function getStoreSettings() {
  const settings = await prisma.storeSettings.upsert({
    where: { id: STORE_SETTINGS_SINGLETON_ID },
    update: {},
    create: {
      id: STORE_SETTINGS_SINGLETON_ID,
      deliveryNotes: "",
      defaultHandlingFee: 0,
      weightUnit: "kg",
      dimensionUnit: "cm",
      mapsEnabled: false,
      defaultMapZoom: 12,
      serviceAreaCountries: [],
    },
  })

  return normalizeStoreSettings(settings)
}

export async function getPaymentMethodSettings() {
  const settings = await Promise.all(
    [
      PaymentGateway.STRIPE,
      PaymentGateway.PAYPAL,
      PaymentGateway.CASH_ON_DELIVERY,
    ].map((gateway) =>
      prisma.paymentMethodSetting.upsert({
        where: { gateway },
        update: {},
        create: getDefaultPaymentMethodSeed(gateway),
      }),
    ),
  )

  return settings.map(normalizePaymentMethodSetting)
}

export async function getPaymentMethodSettingsMap() {
  const settings = await getPaymentMethodSettings()

  return new Map(settings.map((setting) => [setting.gateway, setting]))
}

export function isPaymentMethodConfigured(setting: ReturnType<typeof normalizePaymentMethodSetting>) {
  if (!setting.isEnabled) {
    return false
  }

  if (setting.gateway === PaymentGateway.CASH_ON_DELIVERY) {
    return true
  }

  return Boolean(setting.publicKey?.trim() && setting.secretKey?.trim())
}

export type NormalizedStoreSettings = Awaited<ReturnType<typeof getStoreSettings>>
export type NormalizedPaymentMethodSetting = Awaited<
  ReturnType<typeof getPaymentMethodSettings>
>[number]
