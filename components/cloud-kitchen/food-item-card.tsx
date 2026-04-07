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
    itemType: "SINGLE" | "COMBO";
    offerTitle: string | null;
    offerDescription: string | null;
    includedItemsSummary: string | null;
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
      <div className="mt-4 space-y-4">
        <Link href={`/food/menu/${item.slug}`} className="block text-lg font-semibold text-[var(--foreground)]">
          {item.name}
        </Link>
        <p className="text-lg font-semibold text-[var(--foreground)]">{formatCurrency(item.price)}</p>
        <AddToFoodCartButton
          item={{
            id: item.id,
            kitchenId: item.kitchenId,
            slug: item.slug,
            name: item.name,
            imageUrl: item.imageUrl,
            price: item.price,
            categoryName: item.foodCategory.name,
            itemType: item.itemType,
            offerTitle: item.offerTitle,
          }}
        />
      </div>
    </article>
  );
}