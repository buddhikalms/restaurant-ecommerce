"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { type ReorderCartItem } from "@/lib/data/account";

export function ReorderButton({
  items,
  unavailableItems,
  className
}: {
  items: ReorderCartItem[];
  unavailableItems: string[];
  className?: string;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [isPending, startTransition] = useTransition();
  const hasItems = items.length > 0;

  return (
    <div className={className}>
      <Button
        type="button"
        className="w-full"
        disabled={!hasItems || isPending}
        onClick={() => {
          if (!hasItems) {
            return;
          }

          startTransition(() => {
            for (const item of items) {
              addItem(item);
            }

            const query = new URLSearchParams({
              reordered: "1",
              added: String(items.length)
            });

            if (unavailableItems.length > 0) {
              query.set("skipped", String(unavailableItems.length));
            }

            router.push(`/cart?${query.toString()}`);
            router.refresh();
          });
        }}
      >
        {isPending ? "Building your cart..." : hasItems ? "Reorder these items" : "Reorder unavailable"}
      </Button>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Reorder uses the current catalog, active variants, live stock, and your current pricing.
      </p>
      {unavailableItems.length > 0 ? (
        <p className="mt-2 text-xs leading-5 text-amber-700">
          {unavailableItems.length} item{unavailableItems.length === 1 ? "" : "s"} from this order could not be added automatically.
        </p>
      ) : null}
    </div>
  );
}
