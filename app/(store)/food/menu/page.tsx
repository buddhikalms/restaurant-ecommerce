import Link from "next/link";
import { redirect } from "next/navigation";

import { FoodItemCard } from "@/components/cloud-kitchen/food-item-card";
import { FoodLocationSummary } from "@/components/cloud-kitchen/food-location-summary";
import { EmptyState } from "@/components/ui/empty-state";
import { getFoodLocationSession } from "@/lib/cloud-kitchen/location-session";
import { getKitchenMenuById } from "@/lib/data/cloud-kitchen";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FoodMenuPage({ searchParams }: { searchParams: SearchParams }) {
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

  const categories = categoryFilter
    ? menu.categories.filter((category: (typeof menu.categories)[number]) => category.slug === categoryFilter)
    : menu.categories;

  return (
    <div className="space-y-6">
      <FoodLocationSummary selection={selection} />

      <section className="surface-card rounded-2xl p-5">
        <p className="section-label">Step 2</p>
        <h1 className="section-title mt-2">Browse the {menu.kitchen.name} menu</h1>
        <p className="section-copy mt-2">
          Delivery availability is locked to the selected address, so the cart only contains items from this kitchen.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/food/menu" className="inline-flex h-9 items-center rounded-full border border-[var(--border)] px-3 text-[0.78rem] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]">
            All categories
          </Link>
          {menu.categories.map((category: (typeof menu.categories)[number]) => (
            <Link key={category.id} href={`/food/menu?category=${category.slug}`} className="inline-flex h-9 items-center rounded-full border border-[var(--border)] px-3 text-[0.78rem] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]">
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      {categories.length ? (
        categories.map((category: (typeof categories)[number]) => (
          <section key={category.id} className="space-y-4">
            <div>
              <p className="section-label">{category.name}</p>
              <h2 className="section-subtitle mt-2">Fresh picks from this category</h2>
              {category.description ? <p className="section-copy mt-2">{category.description}</p> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {category.foodItems.map((item: (typeof category.foodItems)[number]) => (
                <FoodItemCard key={item.id} item={{ ...item, foodCategory: { name: category.name } }} />
              ))}
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

