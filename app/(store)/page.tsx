import Link from "next/link";

import { FoodItemCard } from "@/components/cloud-kitchen/food-item-card";
import { FoodCartProvider } from "@/components/providers/food-cart-provider";
import { HomeHeroSlider } from "@/components/store/home-hero-slider";
import { ProductCard } from "@/components/store/product-card";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getFoodLocationSession } from "@/lib/cloud-kitchen/location-session";
import { getFoodLandingData } from "@/lib/data/cloud-kitchen";
import { getHomepageContent } from "@/lib/data/store";
import {
  canViewWholesalePricing,
  getPricingModeForRole,
} from "@/lib/user-roles";

export default async function HomePage() {
  const [user, homepageContent, foodLanding, selectedFoodLocation] =
    await Promise.all([
      getCurrentUser(),
      getHomepageContent(),
      getFoodLandingData(),
      getFoodLocationSession(),
    ]);

  const pricingMode = getPricingModeForRole(user?.role);
  const showWholesalePrice = canViewWholesalePricing(user?.role);
  const hideNormalPrice = user?.role === "WHOLESALE_CUSTOMER";
  const { featuredProducts, recommendedProducts, categories, totalProducts } =
    homepageContent;
  const heroSlides = [
    {
      id: "hero-1",
      imageUrl: "/A1.webp",
      alt: "Featured restaurant slider image 1",
    },
    {
      id: "hero-2",
      imageUrl: "/A2.webp",
      alt: "Featured restaurant slider image 2",
    },
    {
      id: "hero-3",
      imageUrl: "/A3.webp",
      alt: "Featured restaurant slider image 3",
    },
    {
      id: "hero-4",
      imageUrl: "/A4.webp",
      alt: "Featured restaurant slider image 4",
    },
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
          {
            title: "Fresh deals",
            copy: "Simple promotional space for featured lines and weekly offers.",
          },
          {
            title: "Bulk discounts",
            copy: "Trade buyers can spot bulk pricing and minimums faster.",
          },
          {
            title: "Recommended",
            copy: "Compact card layouts keep browsing quick and focused.",
          },
          {
            title: "Categories",
            copy: "Jump straight to produce, beverages, pantry, and more.",
          },
        ].map((item) => (
          <div key={item.title} className="surface-card rounded-lg p-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {item.title}
            </p>
            <p className="mt-1 text-[0.82rem] leading-6 text-[var(--muted-foreground)]">
              {item.copy}
            </p>
          </div>
        ))}
      </section>

      {foodLanding.featuredItems.length ? (
        <section className="mt-8 rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(121,56,31,0.08),rgba(39,63,49,0.1))] p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-label">Cloud kitchen</p>
              <h2 className="section-subtitle mt-1">
                Ready-to-eat meals before wholesale browsing
              </h2>
              <p className="mt-2 max-w-3xl text-[0.9rem] leading-7 text-[var(--muted-foreground)]">
                These food items are created and managed by admins under the
                cloud-kitchen module. Customers select a delivery location
                first, then order from the eligible kitchen.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={selectedFoodLocation ? "/food/menu" : "/food/location"}
                className="inline-flex h-10 items-center rounded-full bg-[var(--brand)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
              >
                <span className="text-black">
                  {selectedFoodLocation
                    ? "Browse food menu"
                    : "Select delivery location"}
                </span>
              </Link>
              <Link
                href="/food"
                className="inline-flex h-10 items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
              >
                Explore cloud kitchen
              </Link>
            </div>
          </div>

          <FoodCartProvider
            activeKitchenId={selectedFoodLocation?.kitchenId ?? null}
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {foodLanding.featuredItems.map((item) => (
                <FoodItemCard
                  key={item.id}
                  item={{
                    id: item.id,
                    kitchenId: item.kitchenId,
                    slug: item.slug,
                    name: item.name,
                    shortDescription: item.shortDescription,
                    description: item.description,
                    imageUrl: item.imageUrl,
                    price: item.price,
                    compareAtPrice: item.compareAtPrice,
                    preparationTimeMins: item.preparationTimeMins,
                    foodCategory: {
                      name: item.foodCategory?.name ?? "Cloud kitchen",
                    },
                  }}
                />
              ))}
            </div>
          </FoodCartProvider>
        </section>
      ) : null}

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="section-label">Popular wholesale items</p>
            <h2 className="section-subtitle mt-1">Fast-moving products</h2>
          </div>
          <Link
            href="/products"
            className="text-[0.82rem] font-medium text-[var(--brand-dark)] transition hover:text-[var(--brand)]"
          >
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
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {category.name}
              </p>
              <p className="mt-1 text-[0.8rem] leading-6 text-[var(--muted-foreground)]">
                {category.description ||
                  "Products for retail and wholesale buyers."}
              </p>
              <p className="mt-2 text-[0.72rem] text-[var(--muted-foreground)]">
                {category._count.products} products
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
