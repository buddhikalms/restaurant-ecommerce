import Link from "next/link";

import { AddToFoodCartButton } from "@/components/cloud-kitchen/add-to-food-cart-button";
import { RemoteImage } from "@/components/ui/remote-image";
import { formatCurrency } from "@/lib/utils";

export function FoodItemCard({
  item,
}: {
  item: {
    id: string;
    kitchenId: string;
    slug: string;
    name: string;
    shortDescription: string | null;
    description: string;
    imageUrl: string;
    price: number;
    compareAtPrice: number | null;
    preparationTimeMins: number | null;
    foodCategory: {
      name: string;
    };
  };
}) {
  return (
    <article className="surface-card rounded-2xl p-4">
      <Link href={`/food/menu/${item.slug}`}>
        <RemoteImage
          src={item.imageUrl}
          alt={item.name}
          width={480}
          height={320}
          className="h-48 w-full rounded-2xl object-cover"
        />
      </Link>
      <div className="mt-4">
        <p className="text-[0.72rem] uppercase tracking-[0.16em] text-[var(--brand-dark)]">
          {item.foodCategory.name}
        </p>
        <Link href={`/food/menu/${item.slug}`} className="mt-2 block text-lg font-semibold text-[var(--foreground)]">
          {item.name}
        </Link>
        <p className="mt-2 text-[0.82rem] leading-6 text-[var(--muted-foreground)]">
          {item.shortDescription ?? item.description}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-[var(--foreground)]">{formatCurrency(item.price)}</p>
            {item.compareAtPrice ? (
              <p className="text-[0.74rem] text-[var(--muted-foreground)] line-through">
                {formatCurrency(item.compareAtPrice)}
              </p>
            ) : null}
          </div>
          {item.preparationTimeMins ? (
            <p className="text-[0.74rem] text-[var(--muted-foreground)]">
              {item.preparationTimeMins} min prep
            </p>
          ) : null}
        </div>
        <div className="mt-4">
          <AddToFoodCartButton
            item={{
              id: item.id,
              kitchenId: item.kitchenId,
              slug: item.slug,
              name: item.name,
              imageUrl: item.imageUrl,
              price: item.price,
              categoryName: item.foodCategory.name,
            }}
          />
        </div>
      </div>
    </article>
  );
}

