import Link from "next/link";

import { DeleteButton } from "@/components/forms/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { RemoteImage } from "@/components/ui/remote-image";
import { deleteProductAction } from "@/lib/actions/admin-actions";
import { getAdminProducts } from "@/lib/data/admin";
import { getAdminVatSummary } from "@/lib/product-pricing";
import { formatCurrency } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = toValue(params.q);
  const products = await getAdminProducts({ query });

  return (
    <div className="space-y-8">
      <section className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Products
            </p>
            <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900">
              Catalog management
            </h1>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-dark)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
          >
            <span className="text-white">Add product</span>
          </Link>
        </div>
        <form className="mt-6 flex flex-col gap-3 sm:flex-row" method="get">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search by product name, parent SKU, or option SKU"
            className="h-11 flex-1 rounded-full border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[var(--brand)]"
          />
          <button className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800">
            Search
          </button>
        </form>
      </section>

      {products.length ? (
        <div className="grid gap-5">
          {products.map((product) => (
            <div
              key={product.id}
              className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <RemoteImage
                    src={product.imageUrl}
                    alt={product.name}
                    width={160}
                    height={160}
                    className="h-20 w-20 rounded-[1.3rem] object-cover"
                  />
                  <div>
                    <p className="font-heading text-2xl font-semibold text-slate-900">
                      {product.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {product.category.name} | SKU {product.sku} |{" "}
                      {product.productType === "VARIABLE"
                        ? `${product.variants.length} active options`
                        : "Simple product"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Stock {product.stockQuantity} |{" "}
                      {product.productType === "VARIABLE"
                        ? `${product.variantLabel || "Option"} selector`
                        : `Wholesale MOQ ${product.minOrderQuantity}`} |{" "}
                      {getAdminVatSummary(product.vatMode, product.vatRate)} |{" "}
                      {product.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-[1.4rem] bg-[#f9f4ea] px-4 py-3 text-right text-sm text-slate-600">
                    <p>
                      {product.productType === "VARIABLE"
                        ? "Retail total from"
                        : "Retail total"}{" "}
                      {formatCurrency(product.normalPrice)}
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {product.productType === "VARIABLE"
                        ? "Wholesale total from"
                        : "Wholesale total"}{" "}
                      {formatCurrency(product.wholesalePrice)}
                    </p>
                  </div>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
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
              </div>
            </div>
          ))}
        </div>
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
