import Link from "next/link"
import { redirect } from "next/navigation"

import { finalizeCheckoutAction } from "@/lib/actions/order-actions"
import { requireCustomerUser } from "@/lib/auth-helpers"
import { getAccountBasePathForRole } from "@/lib/user-roles"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function toValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function StripeCheckoutReturnPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const user = await requireCustomerUser()
  const params = await searchParams
  const checkoutSessionId = toValue(params.checkout_session_id)

  if (!checkoutSessionId) {
    redirect("/checkout?payment=stripe&status=missing")
  }

  try {
    const order = await finalizeCheckoutAction(checkoutSessionId)
    redirect(`${getAccountBasePathForRole(user.role)}/orders/${order.id}?placed=1&paid=1`)
  } catch (error) {
    return (
      <div className="page-shell py-6 sm:py-8">
        <section className="surface-card rounded-xl p-5">
          <p className="section-label">Stripe payment</p>
          <h1 className="section-title mt-2">We could not confirm this payment yet</h1>
          <p className="section-copy mt-2">
            {error instanceof Error
              ? error.message
              : "Please return to checkout and try again."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/checkout"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-transparent bg-[var(--brand)] px-3.5 text-[0.84rem] font-medium text-white transition hover:bg-[var(--brand-dark)]"
            >
              Back to checkout
            </Link>
            <Link
              href={getAccountBasePathForRole(user.role)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 text-[0.84rem] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
            >
              Go to account
            </Link>
          </div>
        </section>
      </div>
    )
  }
}
