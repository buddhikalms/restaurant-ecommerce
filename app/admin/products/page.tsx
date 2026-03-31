import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteButton } from "@/components/forms/delete-button";
import { StockBadge } from "@/components/store/status-badge";
import { getButtonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { RemoteImage } from "@/components/ui/remote-image";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteProductAction } from "@/lib/actions/admin-actions";
import { getAdminProducts } from "@/lib/data/admin";
import { getAdminVatSummary } from "@/lib/product-pricing";
import { formatCurrency } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toPage(value: string | string[] | undefined) {
  const page = Number(toValue(value));
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function AdminProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = toValue(params.q);
  const status = toValue(params.status) as "active" | "inactive" | undefined;
  const page = toPage(params.page);
  const products = await getAdminProducts({ query, status, page });

  const buildHref = (nextPage: number) => {
    const nextParams = new URLSearchParams();

    if (query) {
      nextParams.set("q", query);
    }

    if (status) {
      nextParams.set("status", status);
    }

    nextParams.set("page", String(nextPage));

    return `/admin/products?${nextParams.toString()}`;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Products"
        title="Dense catalog management with pricing, stock, and actions in one table"
        description="Keep the product list compact and operational, with direct access to edit flows and inventory context."
        actions={
          <>
            <Link
              href="/admin/settings"
              className={getButtonClassName({ variant: "secondary" })}
            >
              Manage taxonomy
            </Link>
            <Link href="/admin/products/new" className={getButtonClassName({})}>
              Add product
            </Link>
          </>
        }
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
              placeholder="Search by product name, parent SKU, or option SKU"
            />
            <Select name="status" defaultValue={status}>
              <option value="">All products</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </Select>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--brand)] px-3.5 text-[0.82rem] font-medium text-white transition hover:bg-[var(--brand-dark)]"
              >
                Apply
              </button>
              <Link
                href="/admin/products"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--admin-border)] px-3 text-[0.8rem] font-medium text-[var(--admin-muted-foreground)] transition hover:bg-[var(--admin-surface-muted)]"
              >
                Clear
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {products.items.length ? (
        <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-[var(--admin-border)] px-4 py-3">
            <div>
              <p className="admin-kicker">Catalog</p>
              <CardTitle className="mt-1 text-sm">
                {products.totalItems} product{products.totalItems === 1 ? "" : "s"}
              </CardTitle>
            </div>
            <p className="text-[0.76rem] text-[var(--admin-muted-foreground)]">
              Page {products.page} of {products.totalPages}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden lg:table-cell">Pricing</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.items.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <RemoteImage
                          src={product.imageUrl}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="h-12 w-12 rounded-xl border border-[var(--admin-border)] object-cover"
                        />
                        <div>
                          <p className="font-medium text-[var(--admin-foreground)]">
                            {product.name}
                          </p>
                          <p className="text-[0.74rem] text-[var(--admin-muted-foreground)]">
                            SKU {product.sku} � {product.productType === "VARIABLE" ? `${product.variants.length} options` : "Simple"}
                          </p>
                          <p className="mt-0.5 text-[0.72rem] text-[var(--admin-muted-foreground)] lg:hidden">
                            Wholesale {formatCurrency(product.wholesalePrice)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-[var(--admin-muted-foreground)]">
                      <div>
                        <p>{product.category.name}</p>
                        <p className="text-[0.72rem]">
                          {getAdminVatSummary(product.vatMode, product.vatRate)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-[0.78rem] text-[var(--admin-muted-foreground)]">
                        <p>Retail {formatCurrency(product.normalPrice)}</p>
                        <p className="mt-0.5 font-medium text-[var(--admin-foreground)]">
                          Wholesale {formatCurrency(product.wholesalePrice)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <StockBadge stockQuantity={product.stockQuantity} />
                        <p className="text-[0.72rem] text-[var(--admin-muted-foreground)]">
                          MOQ {product.minOrderQuantity}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] ${product.isActive ? "bg-[rgba(47,106,74,0.12)] text-[var(--admin-success)]" : "bg-[rgba(179,86,72,0.12)] text-[var(--admin-danger)]"}`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 whitespace-nowrap">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="inline-flex h-8 items-center justify-center rounded-lg border border-[var(--admin-border)] px-3 text-[0.76rem] font-medium text-[var(--admin-foreground)] transition hover:bg-[var(--admin-surface-muted)]"
                        >
                          Edit
                        </Link>
                        <DeleteButton
                          itemId={product.id}
                          action={deleteProductAction}
                          label="Delete"
                          confirmMessage="Delete this product? Existing ordered products cannot be removed."
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-end px-4 pb-4">
              <PaginationControls
                currentPage={products.page}
                totalPages={products.totalPages}
                buildHref={buildHref}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No products found"
          description="Add your first product or broaden the current search query."
          actionLabel="Create product"
          actionHref="/admin/products/new"
        />
      )}
    </div>
  );
}
