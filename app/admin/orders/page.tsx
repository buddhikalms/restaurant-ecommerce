import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrderStatusBadge } from "@/components/store/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ORDER_STATUSES } from "@/lib/constants";
import { getAdminOrders } from "@/lib/data/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toPage(value: string | string[] | undefined) {
  const page = Number(toValue(value));
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = toValue(params.q);
  const status = toValue(params.status);
  const page = toPage(params.page);
  const orders = await getAdminOrders({ query, status, page });

  const buildHref = (nextPage: number) => {
    const nextParams = new URLSearchParams();

    if (query) {
      nextParams.set("q", query);
    }

    if (status) {
      nextParams.set("status", status);
    }

    nextParams.set("page", String(nextPage));

    return `/admin/orders?${nextParams.toString()}`;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Orders"
        title="Fast order triage with compact filters and status visibility"
        description="Search the queue, move through statuses, and jump into any order without leaving the operations view."
      />

      <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
        <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_auto]" method="get">
            <Input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search by order number, email, or business"
            />
            <Select name="status" defaultValue={status}>
              <option value="">All statuses</option>
              {ORDER_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <div className="flex items-center gap-2">
              <Button type="submit">Apply</Button>
              <Link
                href="/admin/orders"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--admin-border)] px-3 text-[0.8rem] font-medium text-[var(--admin-muted-foreground)] transition hover:bg-[var(--admin-surface-muted)]"
              >
                Clear
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {orders.items.length ? (
        <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-[var(--admin-border)] px-4 py-3">
            <div>
              <p className="admin-kicker">Results</p>
              <CardTitle className="mt-1 text-sm">
                {orders.totalItems} order{orders.totalItems === 1 ? "" : "s"}
              </CardTitle>
            </div>
            <p className="text-[0.76rem] text-[var(--admin-muted-foreground)]">
              Page {orders.page} of {orders.totalPages}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Segment</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Placed</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.items.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-[var(--admin-foreground)] transition hover:text-[var(--admin-accent)]"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="mt-0.5 text-[0.74rem] text-[var(--admin-muted-foreground)] md:hidden">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
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
                    <TableCell className="hidden md:table-cell text-[var(--admin-muted-foreground)]">
                      {order.user.role === "WHOLESALE_CUSTOMER" ? "Wholesale" : "Retail"}
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
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[0.78rem] font-medium text-[var(--admin-accent)] transition hover:text-[var(--admin-accent-strong)]"
                      >
                        Open
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-end px-4 pb-4">
              <PaginationControls
                currentPage={orders.page}
                totalPages={orders.totalPages}
                buildHref={buildHref}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No orders found"
          description="Try a broader search or clear the current status filter."
        />
      )}
    </div>
  );
}
