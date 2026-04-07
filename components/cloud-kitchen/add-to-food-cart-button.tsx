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
    itemType: "SINGLE" | "COMBO";
    offerTitle: string | null;
  };
}) {
  const router = useRouter();
  const { addItem } = useFoodCart();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="inline-flex h-10 items-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-1">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm text-[var(--muted-foreground)] transition hover:bg-[var(--surface)]"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="w-10 text-center text-[0.84rem] font-medium text-[var(--foreground)]">
            {quantity}
          </span>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm text-[var(--muted-foreground)] transition hover:bg-[var(--surface)]"
            onClick={() => setQuantity((current) => Math.min(99, current + 1))}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <Button
          type="button"
          className="flex-1"
          onClick={() => {
            const result = addItem({
              foodItemId: item.id,
              kitchenId: item.kitchenId,
              slug: item.slug,
              name: item.name,
              imageUrl: item.imageUrl,
              price: item.price,
              categoryName: item.categoryName,
              itemType: item.itemType,
              offerTitle: item.offerTitle,
              quantity,
            });

            setMessage(
              result.ok
                ? `${quantity} ${quantity === 1 ? "item" : "items"} added to your order.`
                : result.message ?? "Unable to add item.",
            );

            if (result.ok) {
              router.refresh();
            }
          }}
        >
          Add to order
        </Button>
      </div>
      {message ? <p className="text-[0.72rem] text-[var(--muted-foreground)]">{message}</p> : null}
    </div>
  );
}