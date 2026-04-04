"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useFoodCart } from "@/components/providers/food-cart-provider";
import { Button } from "@/components/ui/button";

export function AddToFoodCartButton({
  item,
}: {
  item: {
    id: string;
    kitchenId: string;
    slug: string;
    name: string;
    imageUrl: string;
    price: number;
    categoryName: string;
  };
}) {
  const router = useRouter();
  const { addItem } = useFoodCart();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        className="w-full"
        onClick={() => {
          const result = addItem({
            foodItemId: item.id,
            kitchenId: item.kitchenId,
            slug: item.slug,
            name: item.name,
            imageUrl: item.imageUrl,
            price: item.price,
            categoryName: item.categoryName,
          });

          setMessage(result.ok ? "Added to food cart." : result.message ?? "Unable to add item.");

          if (result.ok) {
            router.refresh();
          }
        }}
      >
        Add to cart
      </Button>
      {message ? <p className="text-[0.72rem] text-[var(--muted-foreground)]">{message}</p> : null}
    </div>
  );
}

