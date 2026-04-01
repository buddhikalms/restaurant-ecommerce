import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrderStatusBadge } from "@/components/store/status-badge";
import { getButtonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/ui/stat-card";
import { getAdminMetrics, getAdminOrders } from "@/lib/data/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [metrics, recentOrders] = await Promise.all([
    getAdminMetrics(),
    getAdminOrders({ page: 1, pageSize: 6 }),
  ]);
  const wholesaleShare =
    metrics.totalCustomers > 0
      ? Math.round((metrics.totalWholesaleCustomers / metrics.totalCustomers) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Dashboard"
        title="Compact command center for daily wholesale operations"
        description="Track revenue, order flow, customer mix, and the most recent activity from one dense but readable workspace."
        actions={
          <>
            <Link
              href="/admin/orders"
              className={getButtonClassName({ variant: "secondary" })}
            >
              View orders
            </Link>
            <Link href="/admin/products/new" className={getButtonClassName({})}>
              <span className="text-white">Add product</span>
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            emphasizeCurrency={stat.emphasizeCurrency}
            trend={stat.trend}
          />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
        <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-[var(--admin-border)] px-4 py-3">
            <div>
              <p className="admin-kicker">Live orders</p>
              <CardTitle className="mt-1 text-sm">Recent activity</CardTitle>
            </div>
            <Link
              href="/admin/orders"
              className="text-[0.78rem] font-medium text-[var(--admin-accent)] transition hover:text-[var(--admin-accent-strong)]"
            >
              Open queue
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Placed</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.items.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-[var(--admin-foreground)] transition hover:text-[var(--admin-accent)]"
                      >
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-[var(--admin-foreground)]">
                          {order.user.businessName || order.user.name}
                        </p>
                        <p className="text-[0.74rem] text-[var(--admin-muted-foreground)]">
                          {order.user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-[var(--admin-muted-foreground)]">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-[var(--admin-foreground)]">
                      {formatCurrency(order.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
            <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
              <p className="admin-kicker">Pipeline</p>
              <CardTitle className="mt-1 text-sm">Pending order value</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div>
                <p className="text-[1.5rem] font-semibold tracking-[-0.03em] text-[var(--admin-foreground)]">
                  {formatCurrency(metrics.pendingRevenue)}
                </p>
                <p className="mt-1 text-[0.8rem] text-[var(--admin-muted-foreground)]">
                  {metrics.pendingOrders} open orders currently waiting for confirmation, processing, or shipment.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  href="/admin/orders?status=PENDING"
                  className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-2 text-[0.78rem] font-medium text-[var(--admin-foreground)] transition hover:border-[var(--admin-border-strong)]"
                >
                  Review pending
                </Link>
                <Link
                  href="/admin/orders?status=PROCESSING"
                  className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-2 text-[0.78rem] font-medium text-[var(--admin-foreground)] transition hover:border-[var(--admin-border-strong)]"
                >
                  View processing
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
            <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
              <p className="admin-kicker">Customer mix</p>
              <CardTitle className="mt-1 text-sm">Retail vs wholesale split</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-[0.78rem]">
                    <span className="font-medium text-[var(--admin-foreground)]">
                      Wholesale customers
                    </span>
                    <span className="text-[var(--admin-muted-foreground)]">
                      {metrics.totalWholesaleCustomers}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--admin-surface-subtle)]">
                    <div
                      className="h-2 rounded-full bg-[var(--admin-accent)]"
                      style={{ width: `${wholesaleShare}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-[0.78rem]">
                    <span className="font-medium text-[var(--admin-foreground)]">
                      Retail customers
                    </span>
                    <span className="text-[var(--admin-muted-foreground)]">
                      {metrics.totalRetailCustomers}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--admin-surface-subtle)]">
                    <div
                      className="h-2 rounded-full bg-[var(--admin-success)]"
                      style={{ width: `${100 - wholesaleShare}%` }}
                    />
                  </div>
                </div>
              </div>
              <Link
                href="/admin/customers"
                className="inline-flex text-[0.78rem] font-medium text-[var(--admin-accent)] transition hover:text-[var(--admin-accent-strong)]"
              >
                Open customer list
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
