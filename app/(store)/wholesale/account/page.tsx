import Link from "next/link";

import { AccountNav } from "@/components/layout/account-nav";
import { OrderStatusBadge } from "@/components/store/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { requireWholesaleUser } from "@/lib/auth-helpers";
import { getAccountOverview } from "@/lib/data/account";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function WholesaleAccountPage() {
  const user = await requireWholesaleUser();
  const overview = await getAccountOverview(user.id);

  return (
    <div className="page-shell py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Wholesale dashboard</p>
          <h1 className="section-title mt-2">{overview.user?.businessName || overview.user?.name}</h1>
          <p className="section-copy mt-2">Manage business details, saved settings, and recent wholesale orders.</p>
        </div>
        <AccountNav mode="wholesale" />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <StatCard label="Total orders" value={overview.totalOrders} />
        <StatCard label="Open orders" value={overview.pendingOrders} />
        <StatCard label="Member since" value={new Date(overview.user?.createdAt || new Date()).getFullYear()} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="surface-card rounded-lg p-5">
          <p className="section-label">Buyer profile</p>
          <dl className="mt-4 space-y-3 text-[0.82rem] text-[var(--muted-foreground)]">
            <div>
              <dt className="font-medium text-[var(--foreground)]">Contact name</dt>
              <dd className="mt-1">{overview.user?.name}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--foreground)]">Business</dt>
              <dd className="mt-1">{overview.user?.businessName || "Not provided"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--foreground)]">Email</dt>
              <dd className="mt-1">{overview.user?.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--foreground)]">Phone</dt>
              <dd className="mt-1">{overview.user?.phone || "Not provided"}</dd>
            </div>
          </dl>
        </section>

        <section className="surface-card rounded-lg p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-label">Recent orders</p>
              <h2 className="section-subtitle mt-2">Latest activity</h2>
            </div>
            <Link href="/wholesale/account/orders" className="warm-link text-[0.82rem]">
              View all
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {overview.recentOrders.length ? (
              overview.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/wholesale/account/orders/${order.id}`}
                  className="block rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4 transition hover:border-[var(--border-strong)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{order.orderNumber}</p>
                      <p className="mt-1 text-[0.78rem] text-[var(--muted-foreground)]">
                        Placed {formatDate(order.createdAt)} - {order.itemCount} items
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <span className="text-sm font-semibold text-[var(--foreground)]">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-[0.82rem] text-[var(--muted-foreground)]">
                No wholesale orders yet. Browse products to place your first business order.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
