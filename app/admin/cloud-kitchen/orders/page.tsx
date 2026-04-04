import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrderStatusBadge } from "@/components/store/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FOOD_ORDER_STATUSES } from "@/lib/constants";
import { getAdminFoodOrders, getKitchenOptions } from "@/lib/data/cloud-kitchen";
import { formatCurrency, formatDate } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminCloudKitchenOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = toValue(params.q);
  const status = toValue(params.status);
  const kitchenId = toValue(params.kitchenId);
  const [orders, kitchens] = await Promise.all([
    getAdminFoodOrders({ query, status, kitchenId }),
    getKitchenOptions(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cloud Kitchen"
        title="Incoming food orders"
        description="Track kitchen-specific delivery orders and update statuses independently from wholesale orders."
      />

      <form className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4" method="get">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
          <Input name="q" defaultValue={query} placeholder="Search order, customer, or kitchen" />
          <Select name="status" defaultValue={status}>
            <option value="">All statuses</option>
            {FOOD_ORDER_STATUSES.map((entry) => (
              <option key={entry} value={entry}>
                {entry.replaceAll("_", " ")}
              </option>
            ))}
          </Select>
          <Select name="kitchenId" defaultValue={kitchenId}>
            <option value="">All kitchens</option>
            {kitchens.map((kitchen: (typeof kitchens)[number]) => (
              <option key={kitchen.id} value={kitchen.id}>
                {kitchen.name}
              </option>
            ))}
          </Select>
          <button className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-[0.82rem] font-medium text-white">
            Filter
          </button>
        </div>
      </form>

      {orders.length ? (
        <div className="space-y-4">
          {orders.map((order: (typeof orders)[number]) => (
            <Link
              key={order.id}
              href={`/admin/cloud-kitchen/orders/${order.id}`}
              className="block rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 transition hover:border-[var(--admin-border-strong)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="admin-kicker">{order.kitchen?.name}</p>
                  <h2 className="mt-2 text-lg font-semibold text-[var(--admin-foreground)]">{order.orderNumber}</h2>
                  <p className="mt-2 text-[0.82rem] text-[var(--admin-muted-foreground)]">
                    {order.customerName} • {order.customerEmail} • {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-semibold text-[var(--admin-foreground)]">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No food orders found"
          description="Food orders will appear here as soon as customers start using the cloud kitchen flow."
          actionLabel="Open dashboard"
          actionHref="/admin/cloud-kitchen"
        />
      )}
    </div>
  );
}



