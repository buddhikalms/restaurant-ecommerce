import { revalidatePath } from "next/cache"
import {
  CheckoutSessionStatus,
  PaymentGateway,
  PaymentStatus,
  type CheckoutSession,
  type Order,
  Prisma,
  type User,
} from "@/generated/prisma"

import { sendOrderEmails } from "@/lib/email"
import { decrementInventoryForCheckoutItems, normalizeCheckoutCartItems, type CheckoutItemInput, type NormalizedCheckoutCart } from "@/lib/checkout/cart"
import { CHECKOUT_SESSION_EXPIRY_MINUTES } from "@/lib/commerce/constants"
import {
  capturePayPalOrder,
  createPayPalOrder,
  createStripePaymentIntent,
  getAvailablePaymentMethods,
  getPaymentMethodSettingByGateway,
  retrieveStripeCheckoutSession,
  validateCashOnDeliveryEligibility,
} from "@/lib/payments/service"
import { prisma } from "@/lib/prisma"
import { getStoreSettings } from "@/lib/settings/store-settings"
import { getAvailableShippingMethods, type AvailableShippingMethod, type CheckoutAddress, type ResolvedShippingZone } from "@/lib/shipping/service"
import { type PricingMode } from "@/lib/user-roles"
import { generateOrderNumber } from "@/lib/utils"

export type CheckoutInputBase = CheckoutAddress & {
  customerName: string
  businessName?: string | null
  email: string
  phone: string
  notes?: string | null
  items: CheckoutItemInput[]
  selectedShippingMethodId?: string | null
  paymentGateway?: PaymentGateway | null
}

export type CheckoutQuote = {
  cart: NormalizedCheckoutCart
  zone: ResolvedShippingZone | null
  shippingMethods: AvailableShippingMethod[]
  selectedShippingMethod: AvailableShippingMethod | null
  paymentMethods: Awaited<ReturnType<typeof getAvailablePaymentMethods>>
  selectedPaymentGateway: PaymentGateway | null
  handlingFee: number
  shippingCost: number
  paymentFee: number
  total: number
  storeSettings: Awaited<ReturnType<typeof getStoreSettings>>
}

type StoredCheckoutPayload = {
  input: Omit<CheckoutInputBase, "paymentGateway"> & { paymentGateway: PaymentGateway }
  pricingMode: PricingMode
  cart: NormalizedCheckoutCart
  zone: ResolvedShippingZone
  shippingMethod: AvailableShippingMethod
  handlingFee: number
  paymentFee: number
  total: number
}

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function buildOrderEmailShippingAddress(input: CheckoutInputBase) {
  return {
    line1: input.line1,
    line2: normalizeOptionalText(input.line2),
    city: input.city,
    state: input.state,
    postalCode: input.postalCode,
    country: input.country,
  }
}

function createCheckoutExpiryDate() {
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + CHECKOUT_SESSION_EXPIRY_MINUTES)
  return expiresAt
}

function toInputJsonValue(value?: Prisma.JsonValue | Prisma.JsonObject | Prisma.JsonArray | null) {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return Prisma.JsonNull
  }

  return value as Prisma.InputJsonValue
}

async function persistShippingAddress({
  tx,
  user,
  input,
}: {
  tx: Prisma.TransactionClient
  user: Pick<User, "id"> & { businessName?: string | null }
  input: CheckoutInputBase
}) {
  await tx.address.updateMany({
    where: {
      userId: user.id,
      isDefault: true,
    },
    data: {
      isDefault: false,
    },
  })

  return tx.address.create({
    data: {
      userId: user.id,
      label: "Primary Shipping",
      contactName: input.customerName,
      businessName: normalizeOptionalText(input.businessName) ?? user.businessName ?? null,
      line1: input.line1,
      line2: normalizeOptionalText(input.line2),
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      country: input.country,
      phone: input.phone,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      placeId: normalizeOptionalText(input.placeId),
      isDefault: true,
    },
  })
}

async function createOrderRecord({
  tx,
  user,
  payload,
  paymentStatus,
  paymentReference,
  transactionId,
  gatewayResponseSummary,
  paidAt,
  checkoutSessionId,
}: {
  tx: Prisma.TransactionClient
  user: Pick<User, "id"> & { businessName?: string | null }
  payload: StoredCheckoutPayload
  paymentStatus: PaymentStatus
  paymentReference?: string | null
  transactionId?: string | null
  gatewayResponseSummary?: Prisma.JsonObject | Prisma.JsonArray | null
  paidAt?: Date | null
  checkoutSessionId?: string
}) {
  const shippingAddress = await persistShippingAddress({
    tx,
    user,
    input: payload.input,
  })

  await decrementInventoryForCheckoutItems(tx, payload.cart.items)

  const order = await tx.order.create({
    data: {
      orderNumber: generateOrderNumber(payload.pricingMode),
      userId: user.id,
      shippingAddressId: shippingAddress.id,
      shippingZoneId: payload.zone.id,
      shippingMethodId: payload.shippingMethod.id,
      shippingMethodName: payload.shippingMethod.name,
      shippingMethodType: payload.shippingMethod.type,
      estimatedDeliveryMinDays: payload.shippingMethod.estimatedMinDays,
      estimatedDeliveryMaxDays: payload.shippingMethod.estimatedMaxDays,
      deliveryMethodDescription: payload.shippingMethod.description,
      deliveryInstructions: payload.shippingMethod.instructions,
      paymentGateway: payload.input.paymentGateway,
      paymentMethodName: payload.input.paymentGateway,
      paymentStatus,
      paymentReference: paymentReference ?? null,
      transactionId: transactionId ?? null,
      gatewayResponseSummary: gatewayResponseSummary ?? undefined,
      paidAt: paidAt ?? null,
      status:
        payload.input.paymentGateway === PaymentGateway.CASH_ON_DELIVERY
          ? "PENDING"
          : "CONFIRMED",
      notes: normalizeOptionalText(payload.input.notes),
      subtotal: payload.cart.subtotal,
      shippingCost: payload.shippingMethod.cost,
      handlingFee: payload.handlingFee,
      codFee: payload.paymentFee,
      total: payload.total,
      itemCount: payload.cart.itemCount,
      items: {
        create: payload.cart.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
      },
      checkoutSession: checkoutSessionId
        ? {
            connect: {
              id: checkoutSessionId,
            },
          }
        : undefined,
    },
    include: {
      shippingAddress: true,
      items: true,
    },
  })

  return order
}

async function sendOrderNotifications({
  order,
  payload,
}: {
  order: Awaited<ReturnType<typeof createOrderRecord>>
  payload: StoredCheckoutPayload
}) {
  try {
    await sendOrderEmails({
      pricingMode: payload.pricingMode,
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      total: Number(order.total),
      customer: {
        name: payload.input.customerName,
        email: payload.input.email,
        phone: payload.input.phone,
        businessName: normalizeOptionalText(payload.input.businessName),
      },
      shippingAddress: buildOrderEmailShippingAddress(payload.input),
      items: payload.cart.items.map((item) => ({
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
      notes: payload.input.notes,
    })
  } catch (error) {
    console.error("[email] Failed to send order emails", error)
  }
}

function revalidateOrderPaths(productSlugs: string[]) {
  revalidatePath("/")
  revalidatePath("/products")
  revalidatePath("/checkout")
  for (const slug of [...new Set(productSlugs)]) {
    revalidatePath(`/products/${slug}`)
  }
  revalidatePath("/account")
  revalidatePath("/account/orders")
  revalidatePath("/wholesale/account")
  revalidatePath("/wholesale/account/orders")
  revalidatePath("/admin")
  revalidatePath("/admin/orders")
  revalidatePath("/admin/customers")
  revalidatePath("/admin/settings")
}

export async function buildCheckoutQuote({
  input,
  pricingMode,
}: {
  input: CheckoutInputBase
  pricingMode: PricingMode
}): Promise<CheckoutQuote> {
  const [cart, storeSettings] = await Promise.all([
    normalizeCheckoutCartItems({ items: input.items, pricingMode }),
    getStoreSettings(),
  ])
  const shipping = await getAvailableShippingMethods(cart, input)

  const selectedShippingMethod =
    shipping.methods.find((method) => method.id === input.selectedShippingMethodId) ??
    shipping.methods[0] ??
    null
  const shippingCost = selectedShippingMethod?.cost ?? 0
  const handlingFee = shipping.handlingFee
  const prePaymentTotal = cart.subtotal + shippingCost + handlingFee
  const paymentMethods = await getAvailablePaymentMethods({
    total: prePaymentTotal,
    shippingMethod: selectedShippingMethod,
    shippingZoneId: shipping.zone?.id ?? null,
  })
  const selectedPaymentGateway =
    paymentMethods.find((method) => method.gateway === input.paymentGateway)?.gateway ??
    paymentMethods[0]?.gateway ??
    null
  const paymentFee =
    paymentMethods.find((method) => method.gateway === selectedPaymentGateway)?.fee ?? 0

  return {
    cart,
    zone: shipping.zone,
    shippingMethods: shipping.methods,
    selectedShippingMethod,
    paymentMethods,
    selectedPaymentGateway,
    handlingFee,
    shippingCost,
    paymentFee,
    total: prePaymentTotal + paymentFee,
    storeSettings,
  }
}

function buildStoredCheckoutPayload({
  input,
  pricingMode,
  quote,
}: {
  input: CheckoutInputBase & { paymentGateway: PaymentGateway }
  pricingMode: PricingMode
  quote: CheckoutQuote
}): StoredCheckoutPayload {
  if (!quote.zone || !quote.selectedShippingMethod) {
    throw new Error("No shipping method is available for the selected address.")
  }

  return {
    input,
    pricingMode,
    cart: quote.cart,
    zone: quote.zone,
    shippingMethod: quote.selectedShippingMethod,
    handlingFee: quote.handlingFee,
    paymentFee: quote.paymentFee,
    total: quote.total,
  }
}

async function createCheckoutSessionRecord({
  userId,
  paymentGateway,
  payload,
}: {
  userId: string
  paymentGateway: PaymentGateway
  payload: StoredCheckoutPayload
}) {
  return prisma.checkoutSession.create({
    data: {
      userId,
      paymentGateway,
      status: CheckoutSessionStatus.PENDING,
      checkoutPayload: payload,
      subtotal: payload.cart.subtotal,
      shippingCost: payload.shippingMethod.cost,
      handlingFee: payload.handlingFee,
      paymentFee: payload.paymentFee,
      total: payload.total,
      shippingZoneId: payload.zone.id,
      shippingMethodId: payload.shippingMethod.id,
      expiresAt: createCheckoutExpiryDate(),
    },
  })
}

export async function placeCodOrder({
  user,
  input,
  pricingMode,
}: {
  user: Pick<User, "id"> & { businessName?: string | null }
  input: CheckoutInputBase & { paymentGateway: "CASH_ON_DELIVERY" }
  pricingMode: PricingMode
}) {
  const quote = await buildCheckoutQuote({ input, pricingMode })

  if (!quote.zone || !quote.selectedShippingMethod) {
    throw new Error("No shipping method is available for the selected address.")
  }

  const codSetting = await getPaymentMethodSettingByGateway(PaymentGateway.CASH_ON_DELIVERY)

  if (!codSetting) {
    throw new Error("Cash on delivery is not configured.")
  }

  const codEligibility = validateCashOnDeliveryEligibility({
    total: quote.total - quote.paymentFee,
    shippingMethod: quote.selectedShippingMethod,
    shippingZoneId: quote.zone.id,
    setting: codSetting,
  })

  if (!codEligibility.eligible) {
    throw new Error(codEligibility.reason)
  }

  const payload = buildStoredCheckoutPayload({
    input,
    pricingMode,
    quote,
  })
  const order = await prisma.$transaction((tx) =>
    createOrderRecord({
      tx,
      user,
      payload,
      paymentStatus: PaymentStatus.PENDING,
    }),
  )

  await sendOrderNotifications({ order, payload })
  revalidateOrderPaths(payload.cart.items.map((item) => item.productSlug))

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
  }
}

export async function startOnlineCheckout({
  user,
  input,
  pricingMode,
}: {
  user: Pick<User, "id"> & { businessName?: string | null }
  input: CheckoutInputBase & { paymentGateway: "STRIPE" | "PAYPAL" }
  pricingMode: PricingMode
}) {
  const quote = await buildCheckoutQuote({ input, pricingMode })

  if (!quote.zone || !quote.selectedShippingMethod) {
    throw new Error("No shipping method is available for the selected address.")
  }

  if (!quote.paymentMethods.some((method) => method.gateway === input.paymentGateway)) {
    throw new Error("The selected payment method is not available for this order.")
  }

  const payload = buildStoredCheckoutPayload({
    input,
    pricingMode,
    quote,
  })
  const checkoutSession = await createCheckoutSessionRecord({
    userId: user.id,
    paymentGateway: input.paymentGateway,
    payload,
  })

  const gatewaySession =
    input.paymentGateway === PaymentGateway.STRIPE
      ? await createStripePaymentIntent({
          sessionId: checkoutSession.id,
          cart: payload.cart,
          shippingCost: payload.shippingMethod.cost,
          handlingFee: payload.handlingFee,
          paymentFee: payload.paymentFee,
          total: payload.total,
          customerEmail: input.email,
        })
      : await createPayPalOrder({
          sessionId: checkoutSession.id,
          cart: payload.cart,
          shippingCost: payload.shippingMethod.cost,
          handlingFee: payload.handlingFee,
          paymentFee: payload.paymentFee,
          total: payload.total,
          customerName: input.customerName,
        })

  await prisma.checkoutSession.update({
    where: { id: checkoutSession.id },
    data: {
      externalReference: gatewaySession.externalReference,
      gatewayResponseSummary: toInputJsonValue(gatewaySession.gatewayResponseSummary as Prisma.JsonValue),
    },
  })

  return {
    redirectUrl: gatewaySession.redirectUrl,
    checkoutSessionId: checkoutSession.id,
  }
}

function parseStoredCheckoutPayload(rawPayload: Prisma.JsonValue) {
  if (!rawPayload || typeof rawPayload !== "object" || Array.isArray(rawPayload)) {
    throw new Error("The checkout session payload is invalid.")
  }

  return rawPayload as unknown as StoredCheckoutPayload
}

async function finalizeCheckoutSessionOrder({
  session,
  paymentStatus,
  paymentReference,
  transactionId,
  gatewayResponseSummary,
  paidAt,
}: {
  session: CheckoutSession
  paymentStatus: PaymentStatus
  paymentReference?: string | null
  transactionId?: string | null
  gatewayResponseSummary?: Prisma.JsonObject | Prisma.JsonArray | null
  paidAt?: Date | null
}) {
  if (session.orderId) {
    const existingOrder = await prisma.order.findUnique({
      where: { id: session.orderId },
      select: { id: true, orderNumber: true },
    })

    if (!existingOrder) {
      throw new Error("The linked order could not be found.")
    }

    return existingOrder
  }

  // Finalization is intentionally idempotent so return pages and webhooks can safely converge here.
  const payload = parseStoredCheckoutPayload(session.checkoutPayload)
  const order = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: { id: session.userId },
      select: { id: true, businessName: true },
    })
    const createdOrder = await createOrderRecord({
      tx,
      user,
      payload,
      paymentStatus,
      paymentReference,
      transactionId,
      gatewayResponseSummary,
      paidAt,
      checkoutSessionId: session.id,
    })

    await tx.checkoutSession.update({
      where: { id: session.id },
      data: {
        status: CheckoutSessionStatus.COMPLETED,
        orderId: createdOrder.id,
        gatewayResponseSummary: toInputJsonValue((gatewayResponseSummary ?? session.gatewayResponseSummary) as Prisma.JsonValue),
      },
    })

    return createdOrder
  })

  await sendOrderNotifications({ order, payload })
  revalidateOrderPaths(payload.cart.items.map((item) => item.productSlug))

  return {
    id: order.id,
    orderNumber: order.orderNumber,
  }
}

export async function finalizePaidOrder({
  checkoutSessionId,
}: {
  checkoutSessionId?: string
}) {
  if (!checkoutSessionId) {
    throw new Error("The payment session reference is missing.")
  }

  const session = await prisma.checkoutSession.findUnique({
    where: { id: checkoutSessionId },
  })

  if (!session) {
    throw new Error("Checkout session not found.")
  }

  if (session.orderId) {
    const order = await prisma.order.findUnique({
      where: { id: session.orderId },
      select: { id: true, orderNumber: true },
    })

    if (!order) {
      throw new Error("The linked order could not be found.")
    }

    return order
  }

  if (session.paymentGateway === PaymentGateway.STRIPE) {
    const stripeSession = await retrieveStripeCheckoutSession(session.externalReference ?? "")

    if (stripeSession.payment_status !== "paid") {
      throw new Error("Stripe has not marked this session as paid yet.")
    }

    return finalizeCheckoutSessionOrder({
      session,
      paymentStatus: PaymentStatus.PAID,
      paymentReference: String(stripeSession.id),
      transactionId:
        stripeSession.payment_intent && typeof stripeSession.payment_intent === "object"
          ? String((stripeSession.payment_intent as { id?: string }).id ?? stripeSession.id)
          : String(stripeSession.id),
      gatewayResponseSummary: stripeSession as Prisma.JsonObject,
      paidAt: new Date(),
    })
  }

  if (session.paymentGateway === PaymentGateway.PAYPAL) {
    const paypalOrder = await capturePayPalOrder(session.externalReference ?? "")
    const captureId = Array.isArray(paypalOrder.purchase_units)
      ? (paypalOrder.purchase_units[0] as {
          payments?: {
            captures?: Array<{ id?: string }>
          }
        })?.payments?.captures?.[0]?.id
      : null

    return finalizeCheckoutSessionOrder({
      session,
      paymentStatus: PaymentStatus.PAID,
      paymentReference: String(paypalOrder.id),
      transactionId: captureId ?? String(paypalOrder.id),
      gatewayResponseSummary: paypalOrder as Prisma.JsonObject,
      paidAt: new Date(),
    })
  }

  throw new Error("Only paid online sessions can be finalized.")
}







