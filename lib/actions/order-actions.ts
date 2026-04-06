"use server"

import { type PaymentGateway } from "@/generated/prisma"

import { type ActionResponse } from "@/lib/actions/action-response"
import { requireCustomerUser } from "@/lib/auth-helpers"
import {
  buildCheckoutQuote,
  finalizePaidOrder,
  placeCodOrder,
  startOnlineCheckout,
  type CheckoutQuote,
} from "@/lib/checkout/service"
import { getPricingModeForRole } from "@/lib/user-roles"
import {
  checkoutQuoteSchema,
  checkoutSchema,
  wholesaleCheckoutQuoteSchema,
  wholesaleCheckoutSchema,
  type CheckoutInput,
  type CheckoutQuoteInput,
} from "@/lib/validations/checkout"

function getCheckoutSchemaForPricingMode(pricingMode: "retail" | "wholesale") {
  return pricingMode === "wholesale" ? wholesaleCheckoutSchema : checkoutSchema
}

function getCheckoutQuoteSchemaForPricingMode(pricingMode: "retail" | "wholesale") {
  return pricingMode === "wholesale"
    ? wholesaleCheckoutQuoteSchema
    : checkoutQuoteSchema
}

function serializeQuote(quote: CheckoutQuote) {
  return {
    subtotal: quote.cart.subtotal,
    itemCount: quote.cart.itemCount,
    totalWeight: quote.cart.totalWeight,
    zone: quote.zone,
    deliveryNotes: quote.storeSettings.deliveryNotes,
    shippingMethods: quote.shippingMethods,
    selectedShippingMethodId: quote.selectedShippingMethod?.id ?? null,
    paymentMethods: quote.paymentMethods,
    selectedPaymentGateway: quote.selectedPaymentGateway ?? null,
    handlingFee: quote.handlingFee,
    shippingCost: quote.shippingCost,
    paymentFee: quote.paymentFee,
    total: quote.total,
  }
}

export async function getCheckoutPreviewAction(
  input: CheckoutQuoteInput,
): Promise<ActionResponse<ReturnType<typeof serializeQuote>>> {
  const user = await requireCustomerUser()
  const pricingMode = getPricingModeForRole(user.role)
  const parsed = getCheckoutQuoteSchemaForPricingMode(pricingMode).safeParse(input)

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the checkout details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const quote = await buildCheckoutQuote({
      input: parsed.data,
      pricingMode,
    })

    return {
      success: true,
      data: serializeQuote(quote),
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "We couldn't calculate checkout options right now.",
    }
  }
}

export async function submitCheckoutAction(
  input: CheckoutInput,
): Promise<
  ActionResponse<
    | { kind: "order"; orderId: string; orderNumber: string }
    | { kind: "redirect"; redirectUrl: string; checkoutSessionId: string }
  >
> {
  const user = await requireCustomerUser()
  const pricingMode = getPricingModeForRole(user.role)
  const parsed = getCheckoutSchemaForPricingMode(pricingMode).safeParse(input)

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the checkout form and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    if (parsed.data.paymentGateway === "CASH_ON_DELIVERY") {
      const order = await placeCodOrder({
        user,
        input: {
          ...parsed.data,
          paymentGateway: "CASH_ON_DELIVERY",
        },
        pricingMode,
      })

      return {
        success: true,
        data: {
          kind: "order",
          orderId: order.orderId,
          orderNumber: order.orderNumber,
        },
        message: "Order placed successfully.",
      }
    }

    const session = await startOnlineCheckout({
      user,
      input: {
        ...parsed.data,
        paymentGateway: parsed.data.paymentGateway as Extract<PaymentGateway, "STRIPE" | "PAYPAL">,
      },
      pricingMode,
    })

    return {
      success: true,
      data: {
        kind: "redirect",
        redirectUrl: session.redirectUrl,
        checkoutSessionId: session.checkoutSessionId,
      },
      message: "Redirecting to the payment gateway.",
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "We couldn't submit your checkout right now.",
    }
  }
}

export async function finalizeCheckoutAction(checkoutSessionId: string) {
  return finalizePaidOrder({ checkoutSessionId })
}

export const placeOrderAction = submitCheckoutAction
