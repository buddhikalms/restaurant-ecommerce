import Link from "next/link";

import { HomeHeroSlider } from "@/components/store/home-hero-slider";
import { ProductCard } from "@/components/store/product-card";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getHomepageContent } from "@/lib/data/store";
import { getPricingModeForRole } from "@/lib/user-roles";

const heroSlides = [
  {
    id: "home-hero-1",
    eyebrow: "Fresh arrivals",
    title: "Restaurant essentials arranged in a bold new homepage slider",
    description:
      "Welcome guests with curated seasonal visuals, faster wayfinding, and a strong first impression built around your A1.webp to A4.webp banner set.",
    imageUrl: "/A1.webp",
    highlights: [
      "Fresh produce",
      "Daily kitchen prep",
      "Clean storefront feel",
    ],
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
    eyebrow: "Bulk-friendly ordering",
    title:
      "Designed for homes, cafes, restaurants, and growing hospitality teams",
    description:
      "The updated hero keeps the message simple and the actions obvious, helping buyers move quickly from browsing to ordering without losing the visual impact of the brand.",
    imageUrl: "/A2.webp",
    highlights: [
      "Retail and wholesale",
      "Clear buying paths",
      "Fast decision making",
    ],
    primaryAction: {
      href: "/products",
      label: "Shop the catalog",
    },
    secondaryAction: {
      href: "/checkout",
      label: "Start checkout",
    },
  },
  {
    id: "home-hero-3",
    eyebrow: "Service-ready stock",
    title:
      "Sharper call-to-action buttons make the main routes much easier to notice",
    description:
      "Both homepage hero buttons now use high-contrast colors and stronger surfaces so the text stays readable over detailed photography and warm overlays.",
    imageUrl: "/A3.webp",
    highlights: [
      "High-contrast CTAs",
      "Visible labels",
      "Branded color treatment",
    ],
    primaryAction: {
      href: "/about",
      label: "Meet the team",
    },
    secondaryAction: {
      href: "/products",
      label: "See featured items",
    },
  },
  {
    id: "home-hero-4",
    eyebrow: "Built for trust",
    title: "A cleaner story from homepage banner to About Us page",
    description:
      "The new page flow connects your hero visuals to a dedicated brand page, giving visitors a stronger sense of who you are before they place an order.",
    imageUrl: "/A4.webp",
    highlights: [
      "Brand storytelling",
      "Stronger navigation",
      "Modern storefront polish",
    ],
    primaryAction: {
      href: "/about",
      label: "Visit About Us",
    },
    secondaryAction: {
      href: "/products",
      label: "Explore products",
    },
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  const pricingMode = getPricingModeForRole(user?.role);
  const showWholesalePrice = Boolean(user);
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
              Products across pantry, frozen, produce, packaging, and beverage
              categories.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/70 bg-[rgba(255,252,246,0.92)] p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Pricing access
            </p>
            <p className="mt-3 font-heading text-3xl font-semibold text-slate-900">
              {showWholesalePrice ? "Wholesale unlocked" : "Normal price only"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Wholesale prices and bulk minimum quantities appear after login,
              while guest users only see normal pricing.
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
              Switch between standard ordering and wholesale buying with the
              right account type.
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
              Freshly styled product boxes for the most popular items
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-[var(--brand-dark)]"
          >
            View full catalog
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              pricingMode={pricingMode}
              showWholesalePrice={showWholesalePrice}
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
              Organized for both everyday shoppers and procurement teams that
              need to find the right stock quickly.
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
