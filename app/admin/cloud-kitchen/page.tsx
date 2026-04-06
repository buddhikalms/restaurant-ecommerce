import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrderStatusBadge } from "@/components/store/status-badge";
import { getButtonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { getAdminCloudKitchenDashboard } from "@/lib/data/cloud-kitchen";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminCloudKitchenPage() {
  const dashboard = await getAdminCloudKitchenDashboard();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cloud Kitchen"
        title="Meals and delivery dashboard"
        description="The default cloud kitchen is created automatically, so you can add meal items and manage delivery settings without registering branches first."
        actions={
          <>
            <Link href="/admin/cloud-kitchen/foods/new" className={getButtonClassName({})}>
              <span className="text-white">Add meal item</span>
            </Link>
            <Link
              href="/admin/cloud-kitchen/kitchens"
              className={getButtonClassName({ variant: "secondary" })}
            >
              Delivery settings
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Kitchens" value={dashboard.stats.kitchens} />
        <StatCard label="Categories" value={dashboard.stats.categories} />
        <StatCard label="Menu items" value={dashboard.stats.foods} />
        <StatCard label="Food orders" value={dashboard.stats.orders} />
        <StatCard label="Revenue" value={dashboard.stats.revenue} emphasizeCurrency />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
          <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
            <CardTitle className="text-sm">Recent food orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {dashboard.recentOrders.map((order: (typeof dashboard.recentOrders)[number]) => (
              <Link
                key={order.id}
                href={`/admin/cloud-kitchen/orders/${order.id}`}
                className="block rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4 transition hover:border-[var(--admin-border-strong)]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-[var(--admin-foreground)]">{order.orderNumber}</p>
                    <p className="mt-1 text-[0.76rem] text-[var(--admin-muted-foreground)]">
                      {order.customerName} • {order.kitchen?.name} • {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-semibold text-[var(--admin-foreground)]">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
          <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
            <CardTitle className="text-sm">Quick links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 text-[0.82rem] text-[var(--admin-muted-foreground)]">
            <Link href="/admin/cloud-kitchen/foods" className="block rounded-xl border border-[var(--admin-border)] px-4 py-3 transition hover:bg-[var(--admin-surface-muted)]">
              Manage meal items and homepage visibility
            </Link>
            <Link href="/admin/cloud-kitchen/kitchens" className="block rounded-xl border border-[var(--admin-border)] px-4 py-3 transition hover:bg-[var(--admin-surface-muted)]">
              Edit default kitchen delivery settings
            </Link>
            <Link href="/admin/cloud-kitchen/delivery-zones" className="block rounded-xl border border-[var(--admin-border)] px-4 py-3 transition hover:bg-[var(--admin-surface-muted)]">
              Optional delivery-zone overrides
            </Link>
            <Link href="/admin/cloud-kitchen/categories" className="block rounded-xl border border-[var(--admin-border)] px-4 py-3 transition hover:bg-[var(--admin-surface-muted)]">
              Organize the meal taxonomy
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

