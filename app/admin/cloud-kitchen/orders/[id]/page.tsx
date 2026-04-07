import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFoodOrderStatusForm } from "@/components/cloud-kitchen/admin-food-order-status-form";
import { OrderStatusBadge } from "@/components/store/status-badge";
import { getAdminFoodOrderById } from "@/lib/data/cloud-kitchen";
import { formatCurrency, formatDate, formatDistanceKm } from "@/lib/utils";

export default async function AdminCloudKitchenOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminFoodOrderById(id);

  if (!order) {
    notFound();
  }

  const isPickup = order.fulfillmentType === "PICKUP";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cloud Kitchen"
        title={order.orderNumber}
        description={`Customer ${order.customerName} • ${order.kitchen?.name}`}
        backHref="/admin/cloud-kitchen/orders"
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="admin-kicker">Items</p>
              <h2 className="mt-2 text-lg font-semibold text-[var(--admin-foreground)]">Kitchen ticket</h2>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="mt-5 space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[var(--admin-foreground)]">{item.foodItemName}</p>
                    <p className="mt-1 text-[0.76rem] text-[var(--admin-muted-foreground)]">
                      {item.foodCategoryName} • {item.quantity} x {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-semibold text-[var(--admin-foreground)]">{formatCurrency(item.lineTotal)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
            <p className="admin-kicker">Status</p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--admin-foreground)]">Update progress</h2>
            <div className="mt-4">
              <AdminFoodOrderStatusForm orderId={order.id} currentStatus={order.status} />
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
            <p className="admin-kicker">{isPickup ? "Pickup" : "Delivery"}</p>
            <dl className="mt-4 space-y-3 text-[0.82rem] text-[var(--admin-muted-foreground)]">
              <div>
                <dt className="font-medium text-[var(--admin-foreground)]">Placed</dt>
                <dd className="mt-1">{formatDate(order.createdAt)}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--admin-foreground)]">Kitchen</dt>
                <dd className="mt-1">{order.kitchen?.name}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--admin-foreground)]">Customer</dt>
                <dd className="mt-1">{order.customerName} • {order.customerPhone}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--admin-foreground)]">Method</dt>
                <dd className="mt-1">{isPickup ? "Pickup" : "Delivery"}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--admin-foreground)]">{isPickup ? "Pickup location" : "Address"}</dt>
                <dd className="mt-1">{order.deliveryAddress?.formattedAddress}</dd>
              </div>
              {!isPickup ? (
                <div>
                  <dt className="font-medium text-[var(--admin-foreground)]">Zone</dt>
                  <dd className="mt-1">{order.deliveryZone?.name ?? "Kitchen radius"}</dd>
                </div>
              ) : null}
              {!isPickup && order.distanceKm !== null ? (
                <div>
                  <dt className="font-medium text-[var(--admin-foreground)]">Distance</dt>
                  <dd className="mt-1">{formatDistanceKm(order.distanceKm)}</dd>
                </div>
              ) : null}
              {order.deliveryAddress?.deliveryInstructions ? (
                <div>
                  <dt className="font-medium text-[var(--admin-foreground)]">{isPickup ? "Pickup instructions" : "Instructions"}</dt>
                  <dd className="mt-1">{order.deliveryAddress.deliveryInstructions}</dd>
                </div>
              ) : null}
              {order.notes ? (
                <div>
                  <dt className="font-medium text-[var(--admin-foreground)]">Kitchen notes</dt>
                  <dd className="mt-1">{order.notes}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
            <p className="admin-kicker">Totals</p>
            <div className="mt-4 space-y-2 text-[0.82rem] text-[var(--admin-muted-foreground)]">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{isPickup ? "Pickup fee" : "Delivery fee"}</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--admin-border)] pt-2 text-sm font-semibold text-[var(--admin-foreground)]">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}