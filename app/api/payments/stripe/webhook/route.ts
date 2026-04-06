import { NextResponse } from "next/server"
import { PaymentGateway } from "@/generated/prisma"

import { finalizePaidOrder } from "@/lib/checkout/service"
import {
  getPaymentMethodSettingByGateway,
  verifyStripeWebhookSignature,
} from "@/lib/payments/service"

export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get("stripe-signature")
  const stripeSetting = await getPaymentMethodSettingByGateway(PaymentGateway.STRIPE)

  if (!stripeSetting?.webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook secret is not configured." },
      { status: 400 },
    )
  }

  const isValid = verifyStripeWebhookSignature({
    payload,
    signature,
    webhookSecret: stripeSetting.webhookSecret,
  })

  if (!isValid) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 })
  }

  const event = JSON.parse(payload) as {
    type?: string
    data?: {
      object?: {
        client_reference_id?: string | null
        metadata?: {
          checkoutSessionId?: string | null
        }
      }
    }
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSessionId =
      event.data?.object?.metadata?.checkoutSessionId ??
      event.data?.object?.client_reference_id ??
      null

    if (checkoutSessionId) {
      try {
        await finalizePaidOrder({ checkoutSessionId })
      } catch (error) {
        console.error("[stripe-webhook] Failed to finalize paid order", error)
        return NextResponse.json({ error: "Failed to finalize order." }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
