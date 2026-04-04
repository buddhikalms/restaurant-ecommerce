import { z } from "zod"

import {
  GATEWAY_MODES,
  PAYMENT_GATEWAYS,
  SHIPPING_METHOD_TYPES,
} from "@/lib/commerce/constants"

const optionalStringSchema = z.string().trim().optional()

const optionalNumberField = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined
  }

  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : value
  }

  return value
}, z.number().min(0).optional())

const requiredNumberField = z.preprocess((value) => {
  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : value
  }

  return value
}, z.number().min(0))

const optionalIntegerField = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined
  }

  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : value
  }

  return value
}, z.number().int().min(0).optional())

export const shippingZoneRegionSchema = z
  .object({
    id: optionalStringSchema,
    country: optionalStringSchema,
    state: optionalStringSchema,
    city: optionalStringSchema,
    postalCodePattern: optionalStringSchema,
    sortOrder: optionalIntegerField.default(0),
  })
  .refine(
    (value) =>
      Boolean(
        value.country?.trim() ||
          value.state?.trim() ||
          value.city?.trim() ||
          value.postalCodePattern?.trim(),
      ),
    {
      message: "Add at least one region rule field.",
      path: ["country"],
    },
  )

export const shippingZoneSchema = z.object({
  id: optionalStringSchema,
  name: z.string().trim().min(2, "Zone name is required"),
  description: optionalStringSchema,
  isEnabled: z.boolean(),
  sortOrder: optionalIntegerField.default(0),
  regions: z.array(shippingZoneRegionSchema).default([]),
})

export const shippingRateTierSchema = z.object({
  id: optionalStringSchema,
  label: optionalStringSchema,
  minimumValue: optionalNumberField,
  maximumValue: optionalNumberField,
  cost: requiredNumberField,
  sortOrder: optionalIntegerField.default(0),
})

export const shippingMethodSchema = z.object({
  id: optionalStringSchema,
  shippingZoneId: z.string().trim().min(1, "Shipping zone is required"),
  name: z.string().trim().min(2, "Method name is required"),
  description: optionalStringSchema,
  type: z.enum(SHIPPING_METHOD_TYPES),
  baseCost: requiredNumberField,
  minimumOrderAmount: optionalNumberField,
  maximumOrderAmount: optionalNumberField,
  minimumWeight: optionalNumberField,
  maximumWeight: optionalNumberField,
  freeShippingMinimum: optionalNumberField,
  maximumDistanceKm: optionalNumberField,
  sortOrder: optionalIntegerField.default(0),
  estimatedMinDays: optionalIntegerField,
  estimatedMaxDays: optionalIntegerField,
  instructions: optionalStringSchema,
  isEnabled: z.boolean(),
  codAllowed: z.boolean(),
  tiers: z.array(shippingRateTierSchema).default([]),
})

export const storeSettingsSchema = z.object({
  deliveryNotes: optionalStringSchema,
  defaultHandlingFee: requiredNumberField,
  weightUnit: z.string().trim().min(1, "Weight unit is required"),
  dimensionUnit: z.string().trim().min(1, "Dimension unit is required"),
  mapsEnabled: z.boolean(),
  googleMapsApiKey: optionalStringSchema,
  defaultMapLatitude: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined
    }

    return typeof value === "number" ? value : Number(value)
  }, z.number().min(-90).max(90).optional()),
  defaultMapLongitude: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined
    }

    return typeof value === "number" ? value : Number(value)
  }, z.number().min(-180).max(180).optional()),
  defaultMapZoom: requiredNumberField,
  storeLocationName: optionalStringSchema,
  storeAddress: optionalStringSchema,
  storeLatitude: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined
    }

    return typeof value === "number" ? value : Number(value)
  }, z.number().min(-90).max(90).optional()),
  storeLongitude: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined
    }

    return typeof value === "number" ? value : Number(value)
  }, z.number().min(-180).max(180).optional()),
  serviceAreaCountriesText: optionalStringSchema,
})

export const paymentMethodSettingSchema = z.object({
  gateway: z.enum(PAYMENT_GATEWAYS),
  displayName: z.string().trim().min(2, "Display name is required"),
  instructions: optionalStringSchema,
  isEnabled: z.boolean(),
  mode: z.enum(GATEWAY_MODES),
  publicKey: optionalStringSchema,
  secretKey: optionalStringSchema,
  webhookSecret: optionalStringSchema,
  extraFee: requiredNumberField,
  minimumOrderAmount: optionalNumberField,
  maximumOrderAmount: optionalNumberField,
  allowedShippingMethodTypes: z.array(z.enum(SHIPPING_METHOD_TYPES)).default([]),
  allowedZoneIds: z.array(z.string()).default([]),
})

export type ShippingZoneInput = z.infer<typeof shippingZoneSchema>
export type ShippingMethodInput = z.infer<typeof shippingMethodSchema>
export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>
export type PaymentMethodSettingInput = z.infer<typeof paymentMethodSettingSchema>
