import Link from "next/link"
import { notFound } from "next/navigation"

import { AccountNav } from "@/components/layout/account-nav"
import { OrderReceiptDownloadLink } from "@/components/store/order-receipt-download-link"
import { ReorderButton } from "@/components/store/reorder-button"
import { OrderStatusBadge } from "@/components/store/status-badge"
import { Badge } from "@/components/ui/badge"
import { requireRetailUser } from "@/lib/auth-helpers"
import { getCustomerOrderById } from "@/lib/data/account"
import { getPricingModeForRole } from "@/lib/user-roles"
import {
  formatCurrency,
  formatDate,
  formatEnumLabel,
  getPaymentStatusTone,
} from "@/lib/utils"

type Params = Promise<{ id: string }>
type SearchParams = Promise<Record<string, string | string[] | undefined>>

function toValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function AccountOrderDetailsPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const user = await requireRetailUser()
  const { id } = await params
  const query = await searchParams
  const order = await getCustomerOrderById(
    user.id,
    id,
    getPricingModeForRole(user.role),
  )

  if (!order) {
    notFound()
  }

  return (
    <div className="page-shell py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Order details</p>
          <h1 className="section-title mt-2">{order.orderNumber}</h1>
          <p className="section-copy mt-2">
            Placed on {formatDate(order.createdAt)}.
          </p>
        </div>
        <AccountNav mode="customer" />
      </div>

      {toValue(query.placed) === "1" ? (
        <div className="notice-success mt-4">
          Your order was submitted successfully.
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="surface-card rounded-lg p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-label">Items</p>
              <h2 className="section-subtitle mt-2">Ordered products</h2>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                      {item.productSku}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {formatCurrency(item.lineTotal)}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-[0.8rem] text-[var(--muted-foreground)]">
                  <span>{item.quantity} units</span>
                  <span>{formatCurrency(item.unitPrice)} each</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="surface-card rounded-lg p-5">
            <p className="section-label">Receipt</p>
            <h2 className="section-subtitle mt-2">Download a copy</h2>
            <p className="mt-3 text-[0.82rem] leading-6 text-[var(--muted-foreground)]">
              Save a receipt for your records or share it with your team.
            </p>
            <div className="mt-4">
              <OrderReceiptDownloadLink orderId={order.id} className="w-full" />
            </div>
          </div>

          <div className="surface-card rounded-lg p-5">
            <p className="section-label">Delivery & payment</p>
            <div className="mt-4 space-y-3 text-[0.82rem] text-[var(--muted-foreground)]">
              <div className="flex flex-wrap gap-2">
                {order.shippingMethodName ? (
                  <Badge className="bg-[rgba(85,99,71,0.12)] text-[var(--accent-dark)]">
                    {order.shippingMethodName}
                  </Badge>
                ) : null}
                <Badge className={getPaymentStatusTone(order.paymentStatus)}>
                  {formatEnumLabel(order.paymentStatus)}
                </Badge>
              </div>
              {order.shippingZone?.name ? <p>Zone: {order.shippingZone.name}</p> : null}
              {order.shippingMethodType ? <p>Method type: {formatEnumLabel(order.shippingMethodType)}</p> : null}
              {order.paymentMethodName ? <p>Payment method: {formatEnumLabel(order.paymentMethodName)}</p> : null}
              {order.paymentReference ? <p>Payment reference: {order.paymentReference}</p> : null}
              {order.transactionId ? <p>Transaction ID: {order.transactionId}</p> : null}
              {order.estimatedDeliveryMinDays || order.estimatedDeliveryMaxDays ? (
                <p>
                  Estimated delivery: {order.estimatedDeliveryMinDays ?? order.estimatedDeliveryMaxDays} to {order.estimatedDeliveryMaxDays ?? order.estimatedDeliveryMinDays} day(s)
                </p>
              ) : null}
              {order.deliveryMethodDescription ? <p>{order.deliveryMethodDescription}</p> : null}
              {order.deliveryInstructions ? <p>{order.deliveryInstructions}</p> : null}
              {order.notes ? <p>Delivery note: {order.notes}</p> : null}
            </div>
          </div>

          <div className="surface-card rounded-lg p-5">
            <p className="section-label">Summary</p>
            <div className="mt-4 space-y-2 text-[0.82rem] text-[var(--muted-foreground)]">
              <div className="flex items-center justify-between">
                <span>Items</span>
                <span>{order.itemCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(order.shippingCost)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Handling</span>
                <span>{formatCurrency(order.handlingFee)}</span>
              </div>
              {order.codFee > 0 ? (
                <div className="flex items-center justify-between">
                  <span>COD fee</span>
                  <span>{formatCurrency(order.codFee)}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between border-t border-[var(--border)] pt-2 text-sm font-semibold text-[var(--foreground)]">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="surface-card rounded-lg p-5">
            <p className="section-label">Shipping address</p>
            <div className="mt-4 text-[0.82rem] leading-6 text-[var(--muted-foreground)]">
              <p className="font-medium text-[var(--foreground)]">
                {order.shippingAddress.contactName}
              </p>
              {order.shippingAddress.businessName ? (
                <p>{order.shippingAddress.businessName}</p>
              ) : null}
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 ? (
                <p>{order.shippingAddress.line2}</p>
              ) : null}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p>{order.shippingAddress.phone}</p>
            </div>
          </div>

          <div className="surface-card rounded-lg p-5">
            <p className="section-label">Reorder</p>
            <h2 className="section-subtitle mt-2">Build this cart again</h2>
            <div className="mt-4">
              <ReorderButton
                items={order.reorderItems}
                unavailableItems={order.unavailableReorderItems}
              />
            </div>
          </div>

          <Link
            href="/account/orders"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 text-[0.84rem] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
          >
            Back to orders
          </Link>
        </aside>
      </div>
    </div>
  )
}
