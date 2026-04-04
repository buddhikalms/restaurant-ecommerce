import Link from "next/link";

import { AccountNav } from "@/components/layout/account-nav";
import { OrderStatusBadge } from "@/components/store/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRetailUser } from "@/lib/auth-helpers";
import { getCustomerFoodOrders } from "@/lib/data/cloud-kitchen";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AccountFoodOrdersPage() {
  const user = await requireRetailUser();
  const orders = await getCustomerFoodOrders(user.id);

  return (
    <div className="page-shell py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Food orders</p>
          <h1 className="section-title mt-2">Ready-to-eat order history</h1>
          <p className="section-copy mt-2">
            Track kitchen delivery progress separately from wholesale product orders.
          </p>
        </div>
        <AccountNav mode="customer" />
      </div>

      <div className="mt-4">
        {orders.length ? (
          <div className="surface-card overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-[0.82rem] text-[var(--muted-foreground)]">
                <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[0.68rem] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Kitchen</th>
                    <th className="px-4 py-3 font-semibold">Placed</th>
                    <th className="px-4 py-3 font-semibold">Items</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
                  {orders.map((order: (typeof orders)[number]) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                        <Link href={`/account/food-orders/${order.id}`} className="warm-link">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{order.kitchen?.name}</td>
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
            title="No food orders yet"
            description="Your cloud-kitchen orders will appear here with kitchen-specific delivery statuses."
            actionLabel="Start food order"
            actionHref="/food/location"
          />
        )}
      </div>
    </div>
  );
}

