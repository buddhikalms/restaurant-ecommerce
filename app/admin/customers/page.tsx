import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
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
import { getAdminCustomers } from "@/lib/data/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toPage(value: string | string[] | undefined) {
  const page = Number(toValue(value));
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function AdminCustomersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = toValue(params.q);
  const role = toValue(params.role) as "CUSTOMER" | "WHOLESALE_CUSTOMER" | undefined;
  const page = toPage(params.page);
  const customers = await getAdminCustomers({ query, role, page });

  const buildHref = (nextPage: number) => {
    const nextParams = new URLSearchParams();

    if (query) {
      nextParams.set("q", query);
    }

    if (role) {
      nextParams.set("role", role);
    }

    nextParams.set("page", String(nextPage));

    return `/admin/customers?${nextParams.toString()}`;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Customers"
        title="Customer operations built for quick scanning and follow-up"
        description="Review account mix, identify repeat buyers, and jump directly into order history from a single table."
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
              placeholder="Search customer name, business, email, or phone"
            />
            <Select name="role" defaultValue={role}>
              <option value="">All customers</option>
              <option value="WHOLESALE_CUSTOMER">Wholesale only</option>
              <option value="CUSTOMER">Retail only</option>
            </Select>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--brand)] px-3.5 text-[0.82rem] font-medium text-white transition hover:bg-[var(--brand-dark)]"
              >
                Apply
              </button>
              <Link
                href="/admin/customers"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--admin-border)] px-3 text-[0.8rem] font-medium text-[var(--admin-muted-foreground)] transition hover:bg-[var(--admin-surface-muted)]"
              >
                Clear
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {customers.items.length ? (
        <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-[var(--admin-border)] px-4 py-3">
            <div>
              <p className="admin-kicker">Accounts</p>
              <CardTitle className="mt-1 text-sm">
                {customers.totalItems} customer{customers.totalItems === 1 ? "" : "s"}
              </CardTitle>
            </div>
            <p className="text-[0.76rem] text-[var(--admin-muted-foreground)]">
              Page {customers.page} of {customers.totalPages}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Orders</TableHead>
                  <TableHead className="hidden lg:table-cell">Revenue</TableHead>
                  <TableHead className="hidden lg:table-cell">Latest activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.items.map((customer) => {
                  const latestOrder = customer.orders[0];

                  return (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-[var(--admin-foreground)]">
                              {customer.businessName || customer.name}
                            </p>
                            <Badge
                              className={
                                customer.role === "WHOLESALE_CUSTOMER"
                                  ? "bg-[rgba(191,102,76,0.12)] text-[var(--admin-accent)]"
                                  : "bg-[rgba(47,106,74,0.12)] text-[var(--admin-success)]"
                              }
                            >
                              {customer.role === "WHOLESALE_CUSTOMER" ? "Wholesale" : "Retail"}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-[0.74rem] text-[var(--admin-muted-foreground)]">
                            Joined {formatDate(customer.createdAt)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-[0.78rem] text-[var(--admin-muted-foreground)]">
                          <p>{customer.email}</p>
                          <p className="mt-0.5">{customer.phone || "No phone on file"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-medium text-[var(--admin-foreground)]">
                        {customer.orderCount}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell font-medium text-[var(--admin-foreground)]">
                        {formatCurrency(customer.totalSpent)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-[var(--admin-muted-foreground)]">
                        {latestOrder ? (
                          <div>
                            <p className="font-medium text-[var(--admin-foreground)]">
                              {latestOrder.orderNumber}
                            </p>
                            <p className="text-[0.72rem]">{formatDate(latestOrder.createdAt)}</p>
                          </div>
                        ) : (
                          "No orders yet"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-3 whitespace-nowrap text-[0.78rem] font-medium">
                          <Link
                            href={`/admin/orders?q=${encodeURIComponent(customer.email)}`}
                            className="text-[var(--admin-accent)] transition hover:text-[var(--admin-accent-strong)]"
                          >
                            Orders
                          </Link>
                          <a
                            href={`mailto:${customer.email}`}
                            className="text-[var(--admin-foreground)] transition hover:text-[var(--admin-accent)]"
                          >
                            Email
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="flex items-center justify-end px-4 pb-4">
              <PaginationControls
                currentPage={customers.page}
                totalPages={customers.totalPages}
                buildHref={buildHref}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No customers found"
          description="Try a broader search or switch the customer segment filter."
        />
      )}
    </div>
  );
}
