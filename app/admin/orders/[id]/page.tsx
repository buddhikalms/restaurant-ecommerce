import { notFound } from "next/navigation";

import { AdminOrderStatusForm } from "@/components/forms/admin-order-status-form";
import { OrderStatusBadge } from "@/components/store/status-badge";
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
    <div className="space-y-8">
      <section className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Order detail</p>
            <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900">{order.orderNumber}</h1>
            <p className="mt-3 text-sm text-slate-600">Placed on {formatDate(order.createdAt)} by {order.user.businessName || order.user.name}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Items</p>
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

        <div className="space-y-6">
          <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Customer</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">{order.user.name}</p>
              <p>{order.user.businessName}</p>
              <p>{order.user.email}</p>
              <p>{order.user.phone || "No phone on profile"}</p>
            </div>
          </div>
          <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Shipping address</p>
            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">{order.shippingAddress.contactName}</p>
              <p>{order.shippingAddress.businessName}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 ? <p>{order.shippingAddress.line2}</p> : null}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p>{order.shippingAddress.phone}</p>
            </div>
          </div>
          <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Order totals</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between"><span>Items</span><span>{order.itemCount}</span></div>
              <div className="flex items-center justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="flex items-center justify-between text-base font-semibold text-slate-900"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
            </div>
          </div>
          <AdminOrderStatusForm orderId={order.id} currentStatus={order.status} />
        </div>
      </div>
    </div>
  );
}
