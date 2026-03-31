import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminAnalytics } from "@/lib/data/admin";
import { formatCurrency } from "@/lib/utils";

export default async function AdminAnalyticsPage() {
  const analytics = await getAdminAnalytics();
  const maxDailyRevenue = Math.max(
    ...analytics.dailyRevenue.map((day) => day.revenue),
    1,
  );
  const maxStatusCount = Math.max(
    ...analytics.statusBreakdown.map((status) => status.count),
    1,
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Analytics"
        title="Operational analytics designed for quick reading, not dashboard noise"
        description="Review fulfillment health, weekly revenue rhythm, customer mix, and the catalog areas carrying the most weight."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
          <CardContent className="space-y-2 p-4">
            <p className="admin-kicker">Average order</p>
            <p className="text-[1.45rem] font-semibold tracking-[-0.03em] text-[var(--admin-foreground)]">
              {formatCurrency(analytics.averageOrderValue)}
            </p>
            <p className="text-[0.76rem] text-[var(--admin-muted-foreground)]">
              Across all non-cancelled revenue booked to date.
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
          <CardContent className="space-y-2 p-4">
            <p className="admin-kicker">Completion rate</p>
            <p className="text-[1.45rem] font-semibold tracking-[-0.03em] text-[var(--admin-foreground)]">
              {analytics.completionRate}%
            </p>
            <p className="text-[0.76rem] text-[var(--admin-muted-foreground)]">
              Share of active orders that have reached the completed state.
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
          <CardContent className="space-y-2 p-4">
            <p className="admin-kicker">Wholesale share</p>
            <p className="text-[1.45rem] font-semibold tracking-[-0.03em] text-[var(--admin-foreground)]">
              {analytics.wholesaleShare}%
            </p>
            <p className="text-[0.76rem] text-[var(--admin-muted-foreground)]">
              Portion of all orders currently coming from wholesale accounts.
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
          <CardContent className="space-y-2 p-4">
            <p className="admin-kicker">Pending revenue</p>
            <p className="text-[1.45rem] font-semibold tracking-[-0.03em] text-[var(--admin-foreground)]">
              {formatCurrency(analytics.metrics.pendingRevenue)}
            </p>
            <p className="text-[0.76rem] text-[var(--admin-muted-foreground)]">
              Value still sitting in pending, confirmed, or processing orders.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
          <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
            <p className="admin-kicker">Status distribution</p>
            <CardTitle className="mt-1 text-sm">Where orders are sitting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {analytics.statusBreakdown.map((item) => (
              <div key={item.status} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-[0.78rem]">
                  <span className="font-medium text-[var(--admin-foreground)]">
                    {item.status.replaceAll("_", " ")}
                  </span>
                  <span className="text-[var(--admin-muted-foreground)]">
                    {item.count} orders � {formatCurrency(item.revenue)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--admin-surface-subtle)]">
                  <div
                    className="h-2 rounded-full bg-[var(--admin-accent)]"
                    style={{ width: `${(item.count / maxStatusCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
          <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
            <p className="admin-kicker">Weekly revenue</p>
            <CardTitle className="mt-1 text-sm">Last 7 days</CardTitle>
          </CardHeader>
          <CardContent className="grid h-[260px] grid-cols-7 items-end gap-2 p-4">
            {analytics.dailyRevenue.map((day) => (
              <div key={day.label} className="flex h-full flex-col justify-end gap-2">
                <div className="flex-1 rounded-t-xl bg-[var(--admin-surface-subtle)] p-1">
                  <div
                    className="w-full rounded-lg bg-[var(--admin-success)]"
                    style={{ height: `${Math.max((day.revenue / maxDailyRevenue) * 100, day.revenue ? 12 : 4)}%` }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[0.74rem] font-medium text-[var(--admin-foreground)]">
                    {day.label}
                  </p>
                  <p className="text-[0.7rem] text-[var(--admin-muted-foreground)]">
                    {day.orders}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
          <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
            <p className="admin-kicker">Mix</p>
            <CardTitle className="mt-1 text-sm">Customer and order composition</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-4 md:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3">
              <p className="text-[0.76rem] font-medium uppercase tracking-[0.14em] text-[var(--admin-muted-foreground)]">
                Customers
              </p>
              {analytics.customerMix.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-[0.82rem]">
                  <span className="text-[var(--admin-foreground)]">{item.label}</span>
                  <span className="font-medium text-[var(--admin-foreground)]">{item.count}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3">
              <p className="text-[0.76rem] font-medium uppercase tracking-[0.14em] text-[var(--admin-muted-foreground)]">
                Orders
              </p>
              {analytics.orderMix.map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[0.82rem]">
                    <span className="text-[var(--admin-foreground)]">{item.label}</span>
                    <span className="font-medium text-[var(--admin-foreground)]">{item.count}</span>
                  </div>
                  <p className="text-[0.72rem] text-[var(--admin-muted-foreground)]">
                    Revenue {formatCurrency(item.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
          <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
            <p className="admin-kicker">Top categories</p>
            <CardTitle className="mt-1 text-sm">Catalog areas with the most products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {analytics.topCategories.map((category, index) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-3"
              >
                <div>
                  <p className="text-[0.82rem] font-medium text-[var(--admin-foreground)]">
                    {index + 1}. {category.name}
                  </p>
                  <p className="mt-1 text-[0.72rem] text-[var(--admin-muted-foreground)]">
                    {category.isActive ? "Active category" : "Inactive category"}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[var(--admin-foreground)]">
                  {category.productCount}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
