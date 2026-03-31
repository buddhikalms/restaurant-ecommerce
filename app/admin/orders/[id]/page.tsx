import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminOrderStatusForm } from "@/components/forms/admin-order-status-form";
import { OrderStatusBadge } from "@/components/store/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminOrderById } from "@/lib/data/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

type Params = Promise<{ id: string }>;

export default async function AdminOrderDetailsPage({ params }: { params: Params }) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Order detail"
        title={order.orderNumber}
        description={`Placed ${formatDate(order.createdAt)} by ${order.user.businessName || order.user.name}.`}
        backHref="/admin/orders"
        backLabel="Back to orders"
        actions={<OrderStatusBadge status={order.status} />}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_360px]">
        <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
          <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
            <p className="admin-kicker">Items</p>
            <CardTitle className="mt-1 text-sm">Ordered products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-[var(--admin-foreground)]">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-[0.72rem] uppercase tracking-[0.14em] text-[var(--admin-muted-foreground)]">
                      {item.productSku}
                    </p>
                  </div>
                  <p className="font-semibold text-[var(--admin-foreground)]">
                    {formatCurrency(item.lineTotal)}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-[0.78rem] text-[var(--admin-muted-foreground)]">
                  <span>{item.quantity} units</span>
                  <span>{formatCurrency(item.unitPrice)} each</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
            <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
              <p className="admin-kicker">Customer</p>
              <CardTitle className="mt-1 text-sm">Contact details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 p-4 text-[0.82rem] text-[var(--admin-muted-foreground)]">
              <p className="font-medium text-[var(--admin-foreground)]">{order.user.name}</p>
              {order.user.businessName ? <p>{order.user.businessName}</p> : null}
              <p>{order.user.email}</p>
              <p>{order.user.phone || "No phone on profile"}</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
            <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
              <p className="admin-kicker">Shipping</p>
              <CardTitle className="mt-1 text-sm">Delivery address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 p-4 text-[0.82rem] text-[var(--admin-muted-foreground)]">
              <p className="font-medium text-[var(--admin-foreground)]">
                {order.shippingAddress.contactName}
              </p>
              {order.shippingAddress.businessName ? <p>{order.shippingAddress.businessName}</p> : null}
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 ? <p>{order.shippingAddress.line2}</p> : null}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p>{order.shippingAddress.phone}</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
            <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
              <p className="admin-kicker">Totals</p>
              <CardTitle className="mt-1 text-sm">Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 text-[0.82rem] text-[var(--admin-muted-foreground)]">
              <div className="flex items-center justify-between">
                <span>Items</span>
                <span>{order.itemCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-[var(--admin-foreground)]">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          <AdminOrderStatusForm orderId={order.id} currentStatus={order.status} />
        </div>
      </div>
    </div>
  );
}
