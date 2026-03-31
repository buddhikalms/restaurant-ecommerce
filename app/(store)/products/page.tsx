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
      pricingMode,
    }),
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
    <div className="page-shell py-6 sm:py-8">
      <section className="surface-card rounded-xl p-5">
        <p className="section-label">Products</p>
        <h1 className="section-title mt-2">Browse the catalog</h1>
        <p className="section-copy mt-2 max-w-3xl">
          Compact product cards, lighter controls, and a cleaner layout make browsing quicker for daily wholesale and retail ordering.
        </p>
      </section>

      <div className="mt-4">
        <ProductFilters
          categories={categories.map((item) => ({ id: item.id, name: item.name, slug: item.slug }))}
          initialQuery={query}
          initialCategory={category}
          initialMinPrice={minPrice}
          initialMaxPrice={maxPrice}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.82rem] text-[var(--muted-foreground)]">{productResult.total} products</p>
        <PaginationControls currentPage={productResult.page} totalPages={productResult.totalPages} buildHref={buildHref} />
      </div>

      <div className="mt-4">
        {productResult.products.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            description="Try adjusting the search term, category, or price range."
            actionLabel="Reset filters"
            actionHref="/products"
          />
        )}
      </div>
    </div>
  );
}
