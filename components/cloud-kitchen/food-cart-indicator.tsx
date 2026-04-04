"use client";

import Link from "next/link";

import { useFoodCart } from "@/components/providers/food-cart-provider";

export function FoodCartIndicator() {
  const { itemCount } = useFoodCart();

  return (
    <Link
      href="/food/cart"
      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[0.78rem] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
    >
      <span>Food cart</span>
      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--brand)] px-2 py-0.5 text-[0.72rem] text-white">
        {itemCount}
      </span>
    </Link>
  );
}

