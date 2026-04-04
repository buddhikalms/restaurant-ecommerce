import { notFound, redirect } from "next/navigation";

import { AddToFoodCartButton } from "@/components/cloud-kitchen/add-to-food-cart-button";
import { FoodLocationSummary } from "@/components/cloud-kitchen/food-location-summary";
import { RemoteImage } from "@/components/ui/remote-image";
import { getFoodLocationSession } from "@/lib/cloud-kitchen/location-session";
import { getFoodItemBySlug } from "@/lib/data/cloud-kitchen";
import { formatCurrency } from "@/lib/utils";

export default async function FoodItemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const selection = await getFoodLocationSession();

  if (!selection) {
    redirect("/food/location");
  }

  const { slug } = await params;
  const item = await getFoodItemBySlug(slug, selection.kitchenId);

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <FoodLocationSummary selection={selection} />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <RemoteImage
          src={item.imageUrl}
          alt={item.name}
          width={900}
          height={700}
          className="h-[420px] w-full rounded-[2rem] object-cover"
        />
        <div className="surface-card rounded-[2rem] p-6">
          <p className="section-label">{item.foodCategory?.name}</p>
          <h1 className="section-title mt-2">{item.name}</h1>
          <p className="mt-3 text-[0.92rem] leading-7 text-[var(--muted-foreground)]">
            {item.description}
          </p>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(item.price)}</p>
              {item.compareAtPrice ? (
                <p className="mt-1 text-[0.8rem] text-[var(--muted-foreground)] line-through">
                  {formatCurrency(item.compareAtPrice)}
                </p>
              ) : null}
            </div>
            {item.preparationTimeMins ? (
              <p className="text-[0.8rem] text-[var(--muted-foreground)]">{item.preparationTimeMins} min prep</p>
            ) : null}
          </div>
          <div className="mt-6">
            <AddToFoodCartButton
              item={{
                id: item.id,
                kitchenId: item.kitchenId,
                slug: item.slug,
                name: item.name,
                imageUrl: item.imageUrl,
                price: item.price,
                categoryName: item.foodCategory?.name ?? "Menu item",
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
