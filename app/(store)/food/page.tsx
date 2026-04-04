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

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="rounded-[2rem] bg-[linear-gradient(135deg,#24150f_0%,#3b2415_48%,#1f2f28_100%)] p-6 text-white shadow-[0_30px_70px_rgba(28,18,12,0.18)]">
          <p className="text-[0.74rem] uppercase tracking-[0.22em] text-[#f4d5a0]">
            Ready-to-eat menu
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Location-first food ordering for CeylonTaste.
          </h2>
          <p className="mt-4 max-w-2xl text-[0.92rem] leading-7 text-white/76">
            The menu only opens after the delivery point is validated. That
            keeps kitchen routing, fees, and distance rules accurate from the
            first click.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/food/location"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-[0.86rem] font-semibold text-[#1b120d] transition hover:brightness-95"
            >
              <span className="text-black">
                {selection
                  ? "Update delivery location"
                  : "Select delivery location"}
              </span>
            </Link>
            <Link
              href={selection ? "/food/menu" : "/food/location"}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-5 text-[0.86rem] font-medium text-white transition hover:bg-white/14"
            >
              Browse menu
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {landing.kitchens.map(
            (kitchen: (typeof landing.kitchens)[number]) => (
              <div key={kitchen.id} className="surface-card rounded-2xl p-5">
                <p className="section-label">Kitchen</p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                  {kitchen.name}
                </h3>
                <p className="mt-2 text-[0.82rem] leading-6 text-[var(--muted-foreground)]">
                  {kitchen.description ?? `${kitchen.city}, ${kitchen.state}`}
                </p>
                <p className="mt-3 text-[0.76rem] text-[var(--muted-foreground)]">
                  {kitchen._count?.foodItems ?? 0} menu items • delivery from{" "}
                  {kitchen.deliveryFee.toFixed(2)}
                </p>
              </div>
            ),
          )}
        </div>
      </section>

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
            <div key={category.id} className="surface-card rounded-2xl p-5">
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
            </div>
          ),
        )}
      </section>
    </div>
  );
}
