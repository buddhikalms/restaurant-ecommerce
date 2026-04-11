"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { useFoodCart } from "@/components/providers/food-cart-provider";
import { cn, formatCurrency } from "@/lib/utils";

export function FoodCartIndicator({
  className,
  showSubtotal = false,
}: {
  className?: string;
  showSubtotal?: boolean;
}) {
  const { itemCount, subtotal } = useFoodCart();

  return (
    <Link
      href="/food/cart"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[0.78rem] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]",
        className,
      )}
    >
      <ShoppingBag className="h-4 w-4" />
      <span>Food cart</span>
      {showSubtotal ? (
        <span className="hidden text-[0.72rem] text-[var(--muted-foreground)] sm:inline">
          {formatCurrency(subtotal)}
        </span>
      ) : null}
      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--brand)] px-2 py-0.5 text-[0.72rem] text-white">
        {itemCount}
      </span>
    </Link>
  );
}
