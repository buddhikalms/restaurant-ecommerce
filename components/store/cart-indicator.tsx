"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { useCart } from "@/components/providers/cart-provider";
import { cn } from "@/lib/utils";

export function CartIndicator({ compact = false }: { compact?: boolean }) {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]",
        compact ? "h-8 px-2.5 text-[0.78rem]" : "h-9 px-3 text-[0.82rem]",
      )}
      aria-label={`Open cart with ${itemCount} item${itemCount === 1 ? "" : "s"}`}
    >
      <ShoppingCart className="h-3.5 w-3.5" />
      {!compact ? <span className="font-medium">Cart</span> : null}
      <span className="inline-flex min-w-5 items-center justify-center rounded-sm bg-[var(--surface-muted)] px-1 text-[0.72rem] font-medium text-[var(--muted-foreground)]">
        {itemCount}
      </span>
    </Link>
  );
}
