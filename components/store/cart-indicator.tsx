"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { useCart } from "@/components/providers/cart-provider";

export function CartIndicator() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="inline-flex h-11 items-center gap-3 rounded-full border border-slate-200 bg-[linear-gradient(135deg,#ffffff,#f6efe2)] px-4 text-sm font-semibold text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:border-[var(--brand)]/25 hover:shadow-[0_14px_28px_rgba(155,95,25,0.14)]"
      aria-label={`Open cart with ${itemCount} item${itemCount === 1 ? "" : "s"}`}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-dark)] text-white shadow-[0_8px_18px_rgba(155,95,25,0.2)]">
        <ShoppingCart className="h-4 w-4" />
      </span>
      <span>Cart</span>
      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-slate-900 px-2 text-xs text-white">
        {itemCount}
      </span>
    </Link>
  );
}
