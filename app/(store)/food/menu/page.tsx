import Link from "next/link";
import { redirect } from "next/navigation";

import { FoodItemCard } from "@/components/cloud-kitchen/food-item-card";
import { FoodLocationSummary } from "@/components/cloud-kitchen/food-location-summary";
import { EmptyState } from "@/components/ui/empty-state";
import { getFoodLocationSession } from "@/lib/cloud-kitchen/location-session";
import { getKitchenMenuById } from "@/lib/data/cloud-kitchen";
import { cn } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FoodMenuPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const selection = await getFoodLocationSession();

  if (!selection) {
    redirect("/food/location");
  }

  const params = await searchParams;
  const categoryFilter = toValue(params.category);
  const menu = await getKitchenMenuById(selection.kitchenId);

  if (!menu) {
    redirect("/food/location");
  }

  const activeCategory = categoryFilter ?? "all";
  const categories = categoryFilter
    ? menu.categories.filter(
        (category: (typeof menu.categories)[number]) =>
          category.slug === categoryFilter,
      )
    : menu.categories;
  const showComboSection = !categoryFilter;

  return (
    <div className="space-y-6">
      <FoodLocationSummary selection={selection} />

      <section className="surface-card rounded-[2rem] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-label">Step 2</p>
            <h1 className="section-title mt-2">Cloud kitchen menu</h1>
            <p className="section-copy mt-2 max-w-3xl">
              Browse foods, meals, beverages, and combo packs from{" "}
              {menu.kitchen.name}. Your order stays locked to the selected
              delivery or pickup option, so everything here is available for the
              current selection.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-[0.8rem] text-[var(--muted-foreground)]">
            <p className="font-medium text-[var(--foreground)]">
              {menu.categories.length} menu categories
            </p>
            <p className="mt-1">
              {menu.categories.reduce(
                (sum: number, category: (typeof menu.categories)[number]) =>
                  sum + category.foodItems.length,
                0,
              )}{" "}
              available products
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/food/menu"
            className={cn(
              "inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-[0.78rem] font-medium transition",
              activeCategory === "all"
                ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
            )}
          >
            <span className="text-white"></span>
            All menu
          </Link>
          {menu.categories.map((category: (typeof menu.categories)[number]) => (
            <Link
              key={category.id}
              href={`/food/menu?category=${category.slug}`}
              className={cn(
                "inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-[0.78rem] font-medium transition",
                activeCategory === category.slug
                  ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                  : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
              )}
            >
              <span className="text-black in-active:text-white">
                {category.name} ({category.foodItems.length})
              </span>
            </Link>
          ))}
        </div>
      </section>

      {showComboSection && menu.comboPacks.length ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-label">Featured offers</p>
              <h2 className="section-subtitle mt-2">Combo packs</h2>
              <p className="section-copy mt-2">
                Value bundles prepared for families, office lunches, and larger
                cravings.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {menu.comboPacks.map((item: (typeof menu.comboPacks)[number]) => (
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

      {categories.length ? (
        categories.map((category: (typeof categories)[number]) => (
          <section key={category.id} className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-label">{category.name}</p>
                <h2 className="section-subtitle mt-2">
                  {category.foodItems.length} items ready to order
                </h2>
                {category.description ? (
                  <p className="section-copy mt-2">{category.description}</p>
                ) : null}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {category.foodItems.map(
                (item: (typeof category.foodItems)[number]) => (
                  <FoodItemCard
                    key={item.id}
                    item={{ ...item, foodCategory: { name: category.name } }}
                  />
                ),
              )}
            </div>
          </section>
        ))
      ) : (
        <EmptyState
          title="No menu items found"
          description="Try another category or update the delivery location to load a different kitchen."
          actionLabel="Change location"
          actionHref="/food/location"
        />
      )}
    </div>
  );
}
