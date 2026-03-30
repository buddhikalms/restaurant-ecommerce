import Link from "next/link";

import { OrderStatusBadge } from "@/components/store/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { getAdminMetrics, getAdminOrders } from "@/lib/data/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [metrics, orders] = await Promise.all([
    getAdminMetrics(),
    getAdminOrders({}),
  ]);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      <section className="surface-card rounded-[2.5rem] border border-white/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
          Overview
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900">
          Retail and wholesale operations dashboard
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          Monitor catalog performance, order throughput, customer mix, and
          pending revenue across both customer segments.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total products" value={metrics.totalProducts} />
        <StatCard label="Total orders" value={metrics.totalOrders} />
        <StatCard
          label="Retail customers"
          value={metrics.totalRetailCustomers}
        />
        <StatCard
          label="Wholesale customers"
          value={metrics.totalWholesaleCustomers}
        />
        <StatCard
          label="Revenue summary"
          value={metrics.revenueSummary}
          emphasizeCurrency
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Pending pipeline
          </p>
          <p className="mt-4 font-heading text-4xl font-semibold text-slate-900">
            {formatCurrency(metrics.pendingRevenue)}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Outstanding order value currently in pending, confirmed, or
            processing states.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/orders"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-dark)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
            >
              Manage orders
            </Link>
            <Link
              href="/admin/products/new"
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Add product
            </Link>
          </div>
        </div>

        <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Recent orders
              </p>
              <h2 className="mt-2 font-heading text-2xl font-semibold text-slate-900">
                Latest order activity
              </h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-sm font-semibold text-[var(--brand-dark)]"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block rounded-[1.5rem] border border-slate-200 bg-white p-5 transition hover:border-[var(--brand)]"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {order.user.businessName || order.user.name} |{" "}
                      {order.user.role === "WHOLESALE_CUSTOMER"
                        ? "Wholesale"
                        : "Retail"}{" "}
                      | {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
