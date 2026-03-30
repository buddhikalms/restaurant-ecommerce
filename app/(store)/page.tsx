import Link from "next/link";

import { HomeHeroSlider } from "@/components/store/home-hero-slider";
import { ProductCard } from "@/components/store/product-card";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getHomepageContent } from "@/lib/data/store";
import {
  canViewWholesalePricing,
  getPricingModeForRole,
} from "@/lib/user-roles";

const heroSlides = [
  {
    id: "home-hero-1",
    eyebrow: "Fresh arrivals",
    title: "Fresh stock for busy kitchens",
    description:
      "Shop produce, pantry lines, and everyday essentials in one clean storefront.",
    imageUrl: "/A1.webp",
    highlights: ["Fresh produce", "Pantry staples", "Fast browsing"],
    primaryAction: {
      href: "/products",
      label: "Browse products",
    },
    secondaryAction: {
      href: "/about",
      label: "About us",
    },
  },
  {
    id: "home-hero-2",
    eyebrow: "Retail and wholesale",
    title: "Simple ordering for homes, cafes, and restaurants",
    description:
      "Retail shoppers see standard prices. Approved trade buyers unlock wholesale prices and MOQs.",
    imageUrl: "/A2.webp",
    highlights: ["Retail + wholesale", "Clear pricing", "Trade signup"],
    primaryAction: {
      href: "/products",
      label: "Shop catalog",
    },
    secondaryAction: {
      href: "/wholesale/register",
      label: "Wholesale signup",
    },
  },
  {
    id: "home-hero-3",
    eyebrow: "Popular picks",
    title: "Featured products with clearer actions",
    description:
      "Product cards now keep pricing, stock, and next steps easy to read at a glance.",
    imageUrl: "/A3.webp",
    highlights: ["Stronger buttons", "Cleaner cards", "Quick decisions"],
    primaryAction: {
      href: "/products",
      label: "See featured items",
    },
    secondaryAction: {
      href: "/about",
      label: "Our service",
    },
  },
  {
    id: "home-hero-4",
    eyebrow: "Built for trust",
    title: "A warmer storefront with a cleaner first impression",
    description:
      "Shorter messaging and tidier spacing help shoppers get where they need faster.",
    imageUrl: "/A4.webp",
    highlights: ["Aligned hero", "Readable CTAs", "Modern finish"],
    primaryAction: {
      href: "/products",
      label: "Explore products",
    },
    secondaryAction: {
      href: "/about",
      label: "Learn more",
    },
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  const pricingMode = getPricingModeForRole(user?.role);
  const showWholesalePrice = canViewWholesalePricing(user?.role);
  const hideNormalPrice = user?.role === "WHOLESALE_CUSTOMER";
  const { featuredProducts, categories, totalProducts } =
    await getHomepageContent();

  return (
    <div className="pb-20">
      <HomeHeroSlider slides={heroSlides} />

      <section className="page-shell mt-16">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[2rem] border border-white/70 bg-[rgba(255,252,246,0.92)] p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Live inventory
            </p>
            <p className="mt-3 font-heading text-4xl font-semibold text-slate-900">
              {totalProducts}+
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Products across pantry, produce, frozen, beverage, and packaging.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/70 bg-[rgba(255,252,246,0.92)] p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Pricing access
            </p>
            <p className="mt-3 font-heading text-3xl font-semibold text-slate-900">
              {showWholesalePrice ? "Wholesale unlocked" : "Retail only"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Trade accounts can view wholesale prices and MOQs. Guests and
              retail users see standard pricing.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/70 bg-[rgba(255,252,246,0.92)] p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Current mode
            </p>
            <p className="mt-3 font-heading text-3xl font-semibold text-slate-900">
              {pricingMode === "wholesale"
                ? "Wholesale active"
                : "Customer active"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use the right account type for everyday shopping or bulk buying.
            </p>
          </div>
        </div>
      </section>

      <section className="page-shell mt-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Featured products
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold text-slate-900 sm:text-4xl">
              Popular picks for kitchens and households
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Cleaner cards, stronger buttons, and pricing that is easier to
              scan.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--brand)]/25 bg-[rgba(255,248,235,0.95)] px-5 text-sm font-semibold text-[var(--brand-dark)] transition hover:border-[var(--brand)]/40 hover:bg-white"
          >
            View full catalog
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-1 xl:grid-cols-3">
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

      <section className="page-shell mt-16">
        <div className="surface-card rounded-[2.5rem] border border-white/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
                Categories
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold text-slate-900">
                Shop by supply category
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Organized for everyday shoppers and procurement teams that need to
              move quickly.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="rounded-[1.8rem] border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-[var(--brand)]"
              >
                <p className="font-heading text-xl font-semibold text-slate-900">
                  {category.name}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {category.description ||
                    "Category for retail and wholesale buyers."}
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
                  {category._count.products} products
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
