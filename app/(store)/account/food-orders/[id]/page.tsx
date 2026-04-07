import Link from "next/link";
import { notFound } from "next/navigation";

import { AccountNav } from "@/components/layout/account-nav";
import { OrderStatusBadge } from "@/components/store/status-badge";
import { requireRetailUser } from "@/lib/auth-helpers";
import { getCustomerFoodOrderById } from "@/lib/data/cloud-kitchen";
import { formatCurrency, formatDate, formatDistanceKm } from "@/lib/utils";

export default async function AccountFoodOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRetailUser();
  const { id } = await params;
  const order = await getCustomerFoodOrderById(user.id, id);

  if (!order) {
    notFound();
  }

  const isPickup = order.fulfillmentType === "PICKUP";

  return (
    <div className="page-shell py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Food order</p>
          <h1 className="section-title mt-2">{order.orderNumber}</h1>
          <p className="section-copy mt-2">
            Placed {formatDate(order.createdAt)} from {order.kitchen?.name}.
          </p>
        </div>
        <AccountNav mode="customer" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <section className="surface-card rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-label">Items</p>
              <h2 className="section-subtitle mt-2">Kitchen ticket</h2>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="mt-5 space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{item.foodItemName}</p>
                    <p className="mt-1 text-[0.76rem] text-[var(--muted-foreground)]">
                      {item.foodCategoryName} • {item.quantity} x {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-semibold text-[var(--foreground)]">{formatCurrency(item.lineTotal)}</p>
                </div>
                {item.foodItem ? (
                  <Link href={`/food/menu/${item.foodItemSlug}`} className="mt-3 inline-flex text-[0.76rem] font-medium text-[var(--brand-dark)]">
                    View menu item
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="surface-card rounded-2xl p-5">
            <p className="section-label">{isPickup ? "Pickup" : "Delivery"}</p>
            <h2 className="section-subtitle mt-2">{isPickup ? "Collection details" : "Address and progress"}</h2>
            <dl className="mt-4 space-y-3 text-[0.82rem] text-[var(--muted-foreground)]">
              <div>
                <dt className="font-medium text-[var(--foreground)]">Kitchen</dt>
                <dd className="mt-1">{order.kitchen?.name}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--foreground)]">Method</dt>
                <dd className="mt-1">{isPickup ? "Pickup" : "Delivery"}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--foreground)]">{isPickup ? "Pickup location" : "Address"}</dt>
                <dd className="mt-1">{order.deliveryAddress?.formattedAddress}</dd>
              </div>
              {!isPickup ? (
                <div>
                  <dt className="font-medium text-[var(--foreground)]">Delivery area</dt>
                  <dd className="mt-1">{order.deliveryZone?.name ?? "Kitchen radius"}</dd>
                </div>
              ) : null}
              {!isPickup && order.distanceKm !== null ? (
                <div>
                  <dt className="font-medium text-[var(--foreground)]">Distance</dt>
                  <dd className="mt-1">{formatDistanceKm(order.distanceKm)}</dd>
                </div>
              ) : null}
              {order.deliveryAddress?.deliveryInstructions ? (
                <div>
                  <dt className="font-medium text-[var(--foreground)]">{isPickup ? "Pickup instructions" : "Instructions"}</dt>
                  <dd className="mt-1">{order.deliveryAddress.deliveryInstructions}</dd>
                </div>
              ) : null}
              {order.notes ? (
                <div>
                  <dt className="font-medium text-[var(--foreground)]">Kitchen notes</dt>
                  <dd className="mt-1">{order.notes}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="surface-card rounded-2xl p-5">
            <p className="section-label">Payment</p>
            <div className="mt-4 space-y-2 text-[0.82rem] text-[var(--muted-foreground)]">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{isPickup ? "Pickup fee" : "Delivery fee"}</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--border)] pt-2 text-sm font-semibold text-[var(--foreground)]">
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