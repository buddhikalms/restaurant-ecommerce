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
    <div className="page-shell py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Wholesale Dashboard</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900">{overview.user?.businessName || overview.user?.name}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Manage your wholesale buyer profile, minimum-order purchasing, and business order history from one place.</p>
        </div>
        <AccountNav mode="wholesale" />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <StatCard label="Total orders" value={overview.totalOrders} />
        <StatCard label="Open orders" value={overview.pendingOrders} />
        <StatCard label="Member since" value={new Date(overview.user?.createdAt || new Date()).getFullYear()} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Buyer profile</p>
          <dl className="mt-6 space-y-4 text-sm text-slate-600">
            <div>
              <dt className="font-semibold text-slate-900">Contact name</dt>
              <dd className="mt-1">{overview.user?.name}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Business</dt>
              <dd className="mt-1">{overview.user?.businessName || "Not provided"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Email</dt>
              <dd className="mt-1">{overview.user?.email}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Phone</dt>
              <dd className="mt-1">{overview.user?.phone || "Not provided"}</dd>
            </div>
          </dl>
        </div>

        <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recent orders</p>
              <h2 className="mt-2 font-heading text-2xl font-semibold text-slate-900">Latest wholesale activity</h2>
            </div>
            <Link href="/wholesale/account/orders" className="text-sm font-semibold text-[var(--brand-dark)]">View all</Link>
          </div>

          <div className="mt-6 space-y-4">
            {overview.recentOrders.length ? (
              overview.recentOrders.map((order) => (
                <Link key={order.id} href={`/wholesale/account/orders/${order.id}`} className="block rounded-[1.6rem] border border-slate-200 bg-white p-5 transition hover:border-[var(--brand)]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                      <p className="mt-1 text-sm text-slate-500">Placed {formatDate(order.createdAt)} | {order.itemCount} items</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <span className="font-semibold text-slate-900">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-600">No wholesale orders yet. Start browsing products to place your first business order.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

