import crypto from "node:crypto"

import { PaymentGateway, type PaymentMethodSetting } from "prisma-generated-client-v2"

import {
  DEFAULT_CURRENCY,
  PAYMENT_GATEWAY_LABELS,
} from "@/lib/commerce/constants"
import { type NormalizedCheckoutCart } from "@/lib/checkout/cart"
import { env } from "@/lib/env"
import {
  getPaymentMethodSettingsMap,
  isPaymentMethodConfigured,
  type NormalizedPaymentMethodSetting,
} from "@/lib/settings/store-settings"
import { type AvailableShippingMethod } from "@/lib/shipping/service"

export type AvailablePaymentMethod = {
  gateway: PaymentGateway
  displayName: string
  instructions: string | null
  fee: number
}

function toMinorUnits(amount: number) {
  return Math.round(amount * 100)
}

function formatMoney(amount: number) {
  return amount.toFixed(2)
}

function buildBaseUrl() {
  return env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
}

function getGatewayModeBaseUrl(setting: Pick<NormalizedPaymentMethodSetting, "gateway" | "mode">) {
  if (setting.gateway === PaymentGateway.PAYPAL) {
    return setting.mode === "LIVE"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com"
  }

  return "https://api.stripe.com"
}

function assertConfigured(
  setting: NormalizedPaymentMethodSetting | undefined,
  message: string,
): asserts setting is NormalizedPaymentMethodSetting {
  if (!setting || !isPaymentMethodConfigured(setting)) {
    throw new Error(message)
  }
}

async function parseApiResponse<T>(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return (await response.json()) as T
  }

  return (await response.text()) as T
}

async function getPayPalAccessToken(setting: NormalizedPaymentMethodSetting) {
  const response = await fetch(`${getGatewayModeBaseUrl(setting)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${setting.publicKey}:${setting.secretKey}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    cache: "no-store",
  })

  if (!response.ok) {
    const errorBody = await parseApiResponse<Record<string, unknown>>(response)
    throw new Error(
      typeof errorBody === "object" && errorBody !== null && "error_description" in errorBody
        ? String(errorBody.error_description)
        : "Unable to authenticate with PayPal.",
    )
  }

  const data = await response.json()
  return String(data.access_token)
}

export async function getAvailablePaymentMethods({
  total,
  shippingMethod,
  shippingZoneId,
}: {
  total: number
  shippingMethod: AvailableShippingMethod | null
  shippingZoneId: string | null
}) {
  const settingsMap = await getPaymentMethodSettingsMap()

  return [
    PaymentGateway.STRIPE,
    PaymentGateway.PAYPAL,
    PaymentGateway.CASH_ON_DELIVERY,
  ].flatMap((gateway) => {
    const setting = settingsMap.get(gateway)

    if (!setting || !isPaymentMethodConfigured(setting)) {
      return []
    }

    if (
      setting.minimumOrderAmount !== null &&
      setting.minimumOrderAmount !== undefined &&
      total < setting.minimumOrderAmount
    ) {
      return []
    }

    if (
      setting.maximumOrderAmount !== null &&
      setting.maximumOrderAmount !== undefined &&
      total > setting.maximumOrderAmount
    ) {
      return []
    }

    if (
      shippingZoneId &&
      setting.allowedZoneIds.length > 0 &&
      !setting.allowedZoneIds.includes(shippingZoneId)
    ) {
      return []
    }

    if (
      shippingMethod &&
      setting.allowedShippingMethodTypes.length > 0 &&
      !setting.allowedShippingMethodTypes.includes(shippingMethod.type)
    ) {
      return []
    }

    if (gateway === PaymentGateway.CASH_ON_DELIVERY) {
      const codEligibility = validateCashOnDeliveryEligibility({
        total,
        shippingMethod,
        shippingZoneId,
        setting,
      })

      if (!codEligibility.eligible) {
        return []
      }
    }

    return [
      {
        gateway,
        displayName: setting.displayName || PAYMENT_GATEWAY_LABELS[gateway],
        instructions: setting.instructions,
        fee: setting.extraFee,
      } satisfies AvailablePaymentMethod,
    ]
  })
}

export function validateCashOnDeliveryEligibility({
  total,
  shippingMethod,
  shippingZoneId,
  setting,
}: {
  total: number
  shippingMethod: AvailableShippingMethod | null
  shippingZoneId: string | null
  setting: NormalizedPaymentMethodSetting
}) {
  if (!setting.isEnabled) {
    return {
      eligible: false,
      reason: "Cash on delivery is disabled.",
    }
  }

  if (!shippingMethod) {
    return {
      eligible: false,
      reason: "Choose a shipping method before selecting cash on delivery.",
    }
  }

  if (!shippingMethod.codAllowed) {
    return {
      eligible: false,
      reason: "Cash on delivery is not available for the selected delivery option.",
    }
  }

  if (setting.allowedZoneIds.length > 0 && (!shippingZoneId || !setting.allowedZoneIds.includes(shippingZoneId))) {
    return {
      eligible: false,
      reason: "Cash on delivery is not available for this delivery area.",
    }
  }

  if (
    setting.allowedShippingMethodTypes.length > 0 &&
    !setting.allowedShippingMethodTypes.includes(shippingMethod.type)
  ) {
    return {
      eligible: false,
      reason: "Cash on delivery is not available for the selected delivery method.",
    }
  }

  if (setting.minimumOrderAmount !== null && total < setting.minimumOrderAmount) {
    return {
      eligible: false,
      reason: `Cash on delivery is available from ${formatMoney(setting.minimumOrderAmount)}.`,
    }
  }

  if (setting.maximumOrderAmount !== null && total > setting.maximumOrderAmount) {
    return {
      eligible: false,
      reason: `Cash on delivery is only available up to ${formatMoney(setting.maximumOrderAmount)}.`,
    }
  }

  return {
    eligible: true,
    fee: setting.extraFee,
  }
}

export async function createStripePaymentIntent({
  sessionId,
  cart,
  shippingCost,
  handlingFee,
  paymentFee,
  total,
  customerEmail,
}: {
  sessionId: string
  cart: NormalizedCheckoutCart
  shippingCost: number
  handlingFee: number
  paymentFee: number
  total: number
  customerEmail: string
}) {
  const settingsMap = await getPaymentMethodSettingsMap()
  const stripeSetting = settingsMap.get(PaymentGateway.STRIPE)
  assertConfigured(
    stripeSetting,
    "Stripe is enabled in admin, but the API keys are incomplete.",
  )

  const params = new URLSearchParams({
    mode: "payment",
    success_url: `${buildBaseUrl()}/checkout/stripe/return?checkout_session_id=${encodeURIComponent(sessionId)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${buildBaseUrl()}/checkout?payment=stripe&status=cancelled`,
    client_reference_id: sessionId,
    customer_email: customerEmail,
    "metadata[checkoutSessionId]": sessionId,
  })

  cart.items.forEach((item, index) => {
    params.append(`line_items[${index}][quantity]`, String(item.quantity))
    params.append(`line_items[${index}][price_data][currency]`, DEFAULT_CURRENCY)
    params.append(`line_items[${index}][price_data][unit_amount]`, String(toMinorUnits(item.unitPrice)))
    params.append(`line_items[${index}][price_data][product_data][name]`, item.productName)
    params.append(`line_items[${index}][price_data][product_data][metadata][sku]`, item.productSku)
  })

  let lineItemIndex = cart.items.length

  if (shippingCost > 0) {
    params.append(`line_items[${lineItemIndex}][quantity]`, "1")
    params.append(`line_items[${lineItemIndex}][price_data][currency]`, DEFAULT_CURRENCY)
    params.append(`line_items[${lineItemIndex}][price_data][unit_amount]`, String(toMinorUnits(shippingCost)))
    params.append(`line_items[${lineItemIndex}][price_data][product_data][name]`, "Shipping")
    lineItemIndex += 1
  }

  if (handlingFee > 0) {
    params.append(`line_items[${lineItemIndex}][quantity]`, "1")
    params.append(`line_items[${lineItemIndex}][price_data][currency]`, DEFAULT_CURRENCY)
    params.append(`line_items[${lineItemIndex}][price_data][unit_amount]`, String(toMinorUnits(handlingFee)))
    params.append(`line_items[${lineItemIndex}][price_data][product_data][name]`, "Handling fee")
    lineItemIndex += 1
  }

  if (paymentFee > 0) {
    params.append(`line_items[${lineItemIndex}][quantity]`, "1")
    params.append(`line_items[${lineItemIndex}][price_data][currency]`, DEFAULT_CURRENCY)
    params.append(`line_items[${lineItemIndex}][price_data][unit_amount]`, String(toMinorUnits(paymentFee)))
    params.append(`line_items[${lineItemIndex}][price_data][product_data][name]`, "Payment fee")
  }

  const response = await fetch(`${getGatewayModeBaseUrl(stripeSetting)}/v1/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSetting.secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
    cache: "no-store",
  })

  const data = await parseApiResponse<Record<string, unknown>>(response)

  if (!response.ok) {
    const message =
      typeof data.error === "object" && data.error !== null && "message" in data.error
        ? String(data.error.message)
        : "Unable to create the Stripe checkout session."
    throw new Error(message)
  }

  if (Number(data.amount_total) !== toMinorUnits(total)) {
    throw new Error("Stripe returned a mismatched checkout total.")
  }

  return {
    externalReference: String(data.id),
    redirectUrl: String(data.url),
    gatewayResponseSummary: data,
  }
}

export async function retrieveStripeCheckoutSession(sessionId: string) {
  const settingsMap = await getPaymentMethodSettingsMap()
  const stripeSetting = settingsMap.get(PaymentGateway.STRIPE)
  assertConfigured(
    stripeSetting,
    "Stripe is enabled in admin, but the API keys are incomplete.",
  )

  const response = await fetch(
    `${getGatewayModeBaseUrl(stripeSetting)}/v1/checkout/sessions/${sessionId}?expand[]=payment_intent`,
    {
      headers: {
        Authorization: `Bearer ${stripeSetting.secretKey}`,
      },
      cache: "no-store",
    },
  )

  const data = await parseApiResponse<Record<string, unknown>>(response)

  if (!response.ok) {
    throw new Error("Unable to verify the Stripe payment status.")
  }

  return data
}

export async function createPayPalOrder({
  sessionId,
  cart,
  shippingCost,
  handlingFee,
  paymentFee,
  total,
  customerName,
}: {
  sessionId: string
  cart: NormalizedCheckoutCart
  shippingCost: number
  handlingFee: number
  paymentFee: number
  total: number
  customerName: string
}) {
  const settingsMap = await getPaymentMethodSettingsMap()
  const payPalSetting = settingsMap.get(PaymentGateway.PAYPAL)
  assertConfigured(
    payPalSetting,
    "PayPal is enabled in admin, but the client credentials are incomplete.",
  )

  const accessToken = await getPayPalAccessToken(payPalSetting)
  const response = await fetch(`${getGatewayModeBaseUrl(payPalSetting)}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: sessionId,
          description: `Checkout ${sessionId}`,
          amount: {
            currency_code: DEFAULT_CURRENCY.toUpperCase(),
            value: formatMoney(total),
            breakdown: {
              item_total: {
                currency_code: DEFAULT_CURRENCY.toUpperCase(),
                value: formatMoney(cart.subtotal),
              },
              shipping: {
                currency_code: DEFAULT_CURRENCY.toUpperCase(),
                value: formatMoney(shippingCost),
              },
              handling: {
                currency_code: DEFAULT_CURRENCY.toUpperCase(),
                value: formatMoney(handlingFee + paymentFee),
              },
            },
          },
          items: cart.items.map((item) => ({
            name: item.productName,
            sku: item.productSku,
            quantity: String(item.quantity),
            unit_amount: {
              currency_code: DEFAULT_CURRENCY.toUpperCase(),
              value: formatMoney(item.unitPrice),
            },
          })),
        },
      ],
      application_context: {
        brand_name: customerName,
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        return_url: `${buildBaseUrl()}/checkout/paypal/return?session=${sessionId}`,
        cancel_url: `${buildBaseUrl()}/checkout?payment=paypal&status=cancelled`,
      },
    }),
    cache: "no-store",
  })

  const data = await parseApiResponse<Record<string, unknown>>(response)

  if (!response.ok) {
    throw new Error("Unable to create the PayPal order.")
  }

  const links = Array.isArray(data.links) ? data.links : []
  const approvalLink = links.find(
    (entry) => typeof entry === "object" && entry !== null && entry.rel === "approve",
  ) as { href?: string } | undefined

  if (!approvalLink?.href) {
    throw new Error("PayPal did not return an approval URL.")
  }

  return {
    externalReference: String(data.id),
    redirectUrl: approvalLink.href,
    gatewayResponseSummary: data,
  }
}

export async function capturePayPalOrder(orderId: string) {
  const settingsMap = await getPaymentMethodSettingsMap()
  const payPalSetting = settingsMap.get(PaymentGateway.PAYPAL)
  assertConfigured(
    payPalSetting,
    "PayPal is enabled in admin, but the client credentials are incomplete.",
  )

  const accessToken = await getPayPalAccessToken(payPalSetting)
  const response = await fetch(
    `${getGatewayModeBaseUrl(payPalSetting)}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({}),
      cache: "no-store",
    },
  )

  const data = await parseApiResponse<Record<string, unknown>>(response)

  if (!response.ok) {
    throw new Error("Unable to capture the PayPal payment.")
  }

  return data
}

export async function getPaymentMethodSettingByGateway(gateway: PaymentGateway) {
  const settingsMap = await getPaymentMethodSettingsMap()
  return settingsMap.get(gateway)
}

export function verifyStripeWebhookSignature({
  payload,
  signature,
  webhookSecret,
}: {
  payload: string
  signature: string | null
  webhookSecret: string
}) {
  if (!signature) {
    return false
  }

  const timestampEntry = signature
    .split(",")
    .find((entry) => entry.startsWith("t="))
    ?.replace("t=", "")
  const expectedSignature = signature
    .split(",")
    .find((entry) => entry.startsWith("v1="))
    ?.replace("v1=", "")

  if (!timestampEntry || !expectedSignature) {
    return false
  }

  const signedPayload = `${timestampEntry}.${payload}`
  const computedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(signedPayload, "utf8")
    .digest("hex")

  return crypto.timingSafeEqual(
    Buffer.from(computedSignature, "utf8"),
    Buffer.from(expectedSignature, "utf8"),
  )
}

export type PaymentGatewaySetting = Awaited<ReturnType<typeof getPaymentMethodSettingByGateway>>

