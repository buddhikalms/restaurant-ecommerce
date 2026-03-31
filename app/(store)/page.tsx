import Link from "next/link";

import { HomeHeroSlider } from "@/components/store/home-hero-slider";
import { ProductCard } from "@/components/store/product-card";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getHomepageContent } from "@/lib/data/store";
import {
  canViewWholesalePricing,
  getPricingModeForRole,
} from "@/lib/user-roles";

export default async function HomePage() {
  const user = await getCurrentUser();
  const pricingMode = getPricingModeForRole(user?.role);
  const showWholesalePrice = canViewWholesalePricing(user?.role);
  const hideNormalPrice = user?.role === "WHOLESALE_CUSTOMER";
  const { featuredProducts, recommendedProducts, categories, totalProducts } =
    await getHomepageContent();
  const heroSlides = [
    { id: "hero-1", imageUrl: "/A1.webp", alt: "Featured restaurant slider image 1" },
    { id: "hero-2", imageUrl: "/A2.webp", alt: "Featured restaurant slider image 2" },
    { id: "hero-3", imageUrl: "/A3.webp", alt: "Featured restaurant slider image 3" },
    { id: "hero-4", imageUrl: "/A4.webp", alt: "Featured restaurant slider image 4" },
  ];

  return (
    <div className="page-shell py-6 sm:py-8">
      <HomeHeroSlider
        slides={heroSlides}
        totalProducts={totalProducts}
        pricingLabel={showWholesalePrice ? "Wholesale" : "Retail"}
        modeLabel={pricingMode === "wholesale" ? "Trade" : "Customer"}
      />

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Fresh deals", copy: "Simple promotional space for featured lines and weekly offers." },
          { title: "Bulk discounts", copy: "Trade buyers can spot bulk pricing and minimums faster." },
          { title: "Recommended", copy: "Compact card layouts keep browsing quick and focused." },
          { title: "Categories", copy: "Jump straight to produce, beverages, pantry, and more." },
        ].map((item) => (
          <div key={item.title} className="surface-card rounded-lg p-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
            <p className="mt-1 text-[0.82rem] leading-6 text-[var(--muted-foreground)]">{item.copy}</p>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="section-label">Popular items</p>
            <h2 className="section-subtitle mt-1">Fast-moving products</h2>
          </div>
          <Link href="/products" className="text-[0.82rem] font-medium text-[var(--brand-dark)] transition hover:text-[var(--brand)]">
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              pricingMode={pricingMode}
              showWholesalePrice={showWholesalePrice}
              hideNormalPrice={hideNormalPrice}
            />
          ))}
        </div>
      </section>

      {recommendedProducts.length ? (
        <section className="mt-8">
          <div className="mb-3">
            <p className="section-label">Recommended</p>
            <h2 className="section-subtitle mt-1">More products to review</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recommendedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                pricingMode={pricingMode}
                showWholesalePrice={showWholesalePrice}
                hideNormalPrice={hideNormalPrice}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8">
        <div className="mb-3">
          <p className="section-label">Categories</p>
          <h2 className="section-subtitle mt-1">Browse by supply type</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="surface-card rounded-lg p-4 transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]"
            >
              <p className="text-sm font-semibold text-[var(--foreground)]">{category.name}</p>
              <p className="mt-1 text-[0.8rem] leading-6 text-[var(--muted-foreground)]">
                {category.description || "Products for retail and wholesale buyers."}
              </p>
              <p className="mt-2 text-[0.72rem] text-[var(--muted-foreground)]">{category._count.products} products</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
