import Link from "next/link";

import { OrderStatusBadge } from "@/components/store/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ORDER_STATUSES } from "@/lib/constants";
import { getAdminOrders } from "@/lib/data/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = toValue(params.q);
  const status = toValue(params.status);
  const orders = await getAdminOrders({ query, status });

  return (
    <div className="space-y-8">
      <section className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Orders</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900">Order management</h1>
        <form className="mt-6 grid gap-3 md:grid-cols-[1fr_220px_auto]" method="get">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search by order number, email, or business"
            className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[var(--brand)]"
          />
          <select name="status" defaultValue={status} className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[var(--brand)]">
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <button className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800">
            Apply filters
          </button>
        </form>
      </section>

      {orders.length ? (
        <div className="grid gap-5">
          {orders.map((order) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`} className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-heading text-2xl font-semibold text-slate-900">{order.orderNumber}</p>
                  <p className="mt-2 text-sm text-slate-600">{order.user.businessName || order.user.name} • {order.user.email}</p>
                  <p className="mt-1 text-sm text-slate-500">Placed {formatDate(order.createdAt)} • {order.itemCount} items</p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-semibold text-slate-900">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="No orders found" description="No orders match the current filters." />
      )}
    </div>
  );
}
