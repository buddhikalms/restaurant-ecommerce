import Link from "next/link";

import { AccountNav } from "@/components/layout/account-nav";
import { OrderStatusBadge } from "@/components/store/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRetailUser } from "@/lib/auth-helpers";
import { getCustomerOrders } from "@/lib/data/account";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AccountOrdersPage() {
  const user = await requireRetailUser();
  const orders = await getCustomerOrders(user.id);

  return (
    <div className="page-shell py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Orders</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900">Order history</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Track current fulfillment status and review previous customer purchases.</p>
        </div>
        <AccountNav mode="customer" />
      </div>

      <div className="mt-8">
        {orders.length ? (
          <div className="surface-card overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-[#f9f4ea] text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Order</th>
                    <th className="px-6 py-4">Placed</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <Link href={`/account/orders/${order.id}`}>{order.orderNumber}</Link>
                      </td>
                      <td className="px-6 py-4">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4">{order.itemCount}</td>
                      <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{formatCurrency(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No orders yet"
            description="Once you place an order, it will appear here with status updates and totals."
            actionLabel="Browse products"
            actionHref="/products"
          />
        )}
      </div>
    </div>
  );
}

