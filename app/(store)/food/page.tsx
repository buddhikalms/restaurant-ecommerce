import Link from "next/link";

import { FoodItemCard } from "@/components/cloud-kitchen/food-item-card";
import { FoodLocationSummary } from "@/components/cloud-kitchen/food-location-summary";
import { getFoodLocationSession } from "@/lib/cloud-kitchen/location-session";
import { getFoodLandingData } from "@/lib/data/cloud-kitchen";

export default async function FoodLandingPage() {
  const [selection, landing] = await Promise.all([
    getFoodLocationSession(),
    getFoodLandingData(),
  ]);

  return (
    <div className="space-y-6">
      <FoodLocationSummary selection={selection} />

      {landing.comboPacks.length ? (
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="section-label">Combo offers</p>
              <h2 className="section-subtitle mt-2">Popular combo packs</h2>
            </div>
            <Link
              href={selection ? "/food/menu?category=combo-packs" : "/food/location"}
              className="warm-link text-[0.82rem]"
            >
              View combo packs
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {landing.comboPacks.map((item: (typeof landing.comboPacks)[number]) => (
              <FoodItemCard
                key={item.id}
                item={{
                  ...item,
                  foodCategory: {
                    name: item.foodCategory?.name ?? "Combo pack",
                  },
                }}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="section-label">Popular dishes</p>
            <h2 className="section-subtitle mt-2">Featured menu items</h2>
          </div>
          <Link
            href={selection ? "/food/menu" : "/food/location"}
            className="warm-link text-[0.82rem]"
          >
            View full menu
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {landing.featuredItems.map(
            (item: (typeof landing.featuredItems)[number]) => (
              <FoodItemCard
                key={item.id}
                item={{
                  ...item,
                  foodCategory: {
                    name: item.foodCategory?.name ?? "Menu item",
                  },
                }}
              />
            ),
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {landing.categories.map(
          (category: (typeof landing.categories)[number]) => (
            <Link
              key={category.id}
              href={selection ? `/food/menu?category=${category.slug}` : "/food/location"}
              className="surface-card rounded-2xl p-5 transition hover:-translate-y-0.5"
            >
              <p className="section-label">Category</p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                {category.name}
              </h3>
              <p className="mt-2 text-[0.82rem] leading-6 text-[var(--muted-foreground)]">
                {category.description ??
                  "Freshly prepared meals built for fast delivery."}
              </p>
              <p className="mt-3 text-[0.76rem] text-[var(--muted-foreground)]">
                {category._count.foodItems} available items
              </p>
            </Link>
          ),
        )}
      </section>
    </div>
  );
}