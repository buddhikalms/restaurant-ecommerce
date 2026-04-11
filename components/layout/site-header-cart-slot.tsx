"use client";

import { usePathname } from "next/navigation";

import { CartIndicator } from "@/components/store/cart-indicator";

export function SiteHeaderCartSlot({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  if (pathname.startsWith("/food")) {
    return null;
  }

  return <CartIndicator compact={compact} />;
}
