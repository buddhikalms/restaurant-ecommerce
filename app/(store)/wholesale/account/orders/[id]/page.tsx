import Link from "next/link";
import { notFound } from "next/navigation";

import { AccountNav } from "@/components/layout/account-nav";
import { ReorderButton } from "@/components/store/reorder-button";
import { OrderStatusBadge } from "@/components/store/status-badge";
import { requireWholesaleUser } from "@/lib/auth-helpers";
import { getCustomerOrderById } from "@/lib/data/account";
import { getPricingModeForRole } from "@/lib/user-roles";
import { formatCurrency, formatDate } from "@/lib/utils";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function WholesaleAccountOrderDetailsPage({
  params,
  searchParams
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const user = await requireWholesaleUser();
  const { id } = await params;
  const query = await searchParams;
  const order = await getCustomerOrderById(user.id, id, getPricingModeForRole(user.role));

  if (!order) {
    notFound();
  }

  return (
    <div className="page-shell py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Wholesale order details</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900">{order.orderNumber}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Placed on {formatDate(order.createdAt)}.</p>
        </div>
        <AccountNav mode="wholesale" />
      </div>

      {toValue(query.placed) === "1" ? (
        <div className="mt-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          Your wholesale order was submitted successfully.
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Items</p>
              <h2 className="mt-2 font-heading text-2xl font-semibold text-slate-900">Ordered products</h2>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="mt-6 space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{item.productName}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{item.productSku}</p>
                  </div>
                  <p className="font-semibold text-slate-900">{formatCurrency(item.lineTotal)}</p>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span>{item.quantity} units</span>
                  <span>{formatCurrency(item.unitPrice)} each</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Summary</p>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Items</span>
                <span>{order.itemCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
          <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Shipping address</p>
            <div className="mt-4 text-sm leading-7 text-slate-600">
              <p className="font-semibold text-slate-900">{order.shippingAddress.contactName}</p>
              {order.shippingAddress.businessName ? <p>{order.shippingAddress.businessName}</p> : null}
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 ? <p>{order.shippingAddress.line2}</p> : null}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p>{order.shippingAddress.phone}</p>
            </div>
          </div>
          <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Reorder</p>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-slate-900">Build this order again</h2>
            <div className="mt-4">
              <ReorderButton items={order.reorderItems} unavailableItems={order.unavailableReorderItems} />
            </div>
          </div>
          <Link
            href="/wholesale/account/orders"
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Back to orders
          </Link>
        </aside>
      </div>
    </div>
  );
}
