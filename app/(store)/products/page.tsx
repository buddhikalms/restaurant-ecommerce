import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ProductCard } from "@/components/store/product-card";
import { ProductFilters } from "@/components/store/product-filters";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getProducts, getStoreCategories } from "@/lib/data/store";
import { canViewWholesalePricing, getPricingModeForRole } from "@/lib/user-roles";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = toValue(params.q);
  const category = toValue(params.category);
  const minPrice = toValue(params.minPrice);
  const maxPrice = toValue(params.maxPrice);
  const page = Number(toValue(params.page) || "1");
  const user = await getCurrentUser();
  const pricingMode = getPricingModeForRole(user?.role);
  const showWholesalePrice = canViewWholesalePricing(user?.role);
  const hideNormalPrice = user?.role === "WHOLESALE_CUSTOMER";

  const [categories, productResult] = await Promise.all([
    getStoreCategories(),
    getProducts({
      query,
      category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page,
      pricingMode
    })
  ]);

  const buildHref = (nextPage: number) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (category) next.set("category", category);
    if (minPrice) next.set("minPrice", minPrice);
    if (maxPrice) next.set("maxPrice", maxPrice);
    next.set("page", String(nextPage));
    return `/products?${next.toString()}`;
  };

  return (
    <div className="page-shell py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Product catalog</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900 sm:text-5xl">Browse polished product cards with protected wholesale pricing</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Search by keyword, narrow by category, and filter by the {pricingMode === "wholesale" ? "wholesale" : "customer"} price currently active for your session.
        </p>
      </div>

      <div className="mt-8">
        <ProductFilters
          categories={categories.map((category) => ({ id: category.id, name: category.name, slug: category.slug }))}
          initialQuery={query}
          initialCategory={category}
          initialMinPrice={minPrice}
          initialMaxPrice={maxPrice}
        />
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-600">Showing {productResult.total} products</p>
        <PaginationControls currentPage={productResult.page} totalPages={productResult.totalPages} buildHref={buildHref} />
      </div>

      <div className="mt-8">
        {productResult.products.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {productResult.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                pricingMode={pricingMode}
                showWholesalePrice={showWholesalePrice}
                hideNormalPrice={hideNormalPrice}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No products matched your filters"
            description="Try removing a search term or widening the price range to see more items."
            actionLabel="Reset catalog"
            actionHref="/products"
          />
        )}
      </div>
    </div>
  );
}


