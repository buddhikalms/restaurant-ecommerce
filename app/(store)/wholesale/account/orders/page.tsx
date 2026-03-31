import Link from "next/link";

import { AccountNav } from "@/components/layout/account-nav";
import { OrderStatusBadge } from "@/components/store/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { requireWholesaleUser } from "@/lib/auth-helpers";
import { getCustomerOrders } from "@/lib/data/account";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function WholesaleAccountOrdersPage() {
  const user = await requireWholesaleUser();
  const orders = await getCustomerOrders(user.id);

  return (
    <div className="page-shell py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Wholesale orders</p>
          <h1 className="section-title mt-2">Order history</h1>
          <p className="section-copy mt-2">Track fulfillment status and review previous business purchases.</p>
        </div>
        <AccountNav mode="wholesale" />
      </div>

      <div className="mt-4">
        {orders.length ? (
          <div className="surface-card overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-[0.82rem] text-[var(--muted-foreground)]">
                <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[0.68rem] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Placed</th>
                    <th className="px-4 py-3 font-semibold">Items</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                        <Link href={`/wholesale/account/orders/${order.id}`} className="warm-link">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3">{order.itemCount}</td>
                      <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 font-medium text-[var(--foreground)]">{formatCurrency(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No wholesale orders yet"
            description="Once you place a wholesale order, it will appear here with status updates and totals."
            actionLabel="Browse products"
            actionHref="/products"
          />
        )}
      </div>
    </div>
  );
}
