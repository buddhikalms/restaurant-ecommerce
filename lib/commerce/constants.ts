export const SHIPPING_METHOD_TYPES = [
  "FLAT_RATE",
  "FREE_SHIPPING",
  "LOCAL_DELIVERY",
  "STORE_PICKUP",
  "WEIGHT_BASED",
  "PRICE_BASED",
] as const

export const PAYMENT_GATEWAYS = [
  "STRIPE",
  "PAYPAL",
  "CASH_ON_DELIVERY",
] as const

export const GATEWAY_MODES = ["SANDBOX", "LIVE"] as const

export const STORE_SETTINGS_SINGLETON_ID = "store-settings"
export const DEFAULT_CURRENCY = "gbp"
export const CHECKOUT_SESSION_EXPIRY_MINUTES = 60

export const SHIPPING_METHOD_LABELS: Record<(typeof SHIPPING_METHOD_TYPES)[number], string> = {
  FLAT_RATE: "Flat rate",
  FREE_SHIPPING: "Free shipping",
  LOCAL_DELIVERY: "Local delivery",
  STORE_PICKUP: "Store pickup",
  WEIGHT_BASED: "Weight based",
  PRICE_BASED: "Price based",
}

export const PAYMENT_GATEWAY_LABELS: Record<(typeof PAYMENT_GATEWAYS)[number], string> = {
  STRIPE: "Stripe",
  PAYPAL: "PayPal",
  CASH_ON_DELIVERY: "Cash on delivery",
}
