import Link from "next/link";

import { FoodCartIndicator } from "@/components/cloud-kitchen/food-cart-indicator";
import { FoodCartProvider } from "@/components/providers/food-cart-provider";
import { getFoodLocationSession } from "@/lib/cloud-kitchen/location-session";

export default async function FoodLayout({ children }: { children: React.ReactNode }) {
  const selection = await getFoodLocationSession();
  const activeKitchenId = selection?.kitchenId ?? null;

  return (
    <FoodCartProvider activeKitchenId={activeKitchenId}>
      <div className="page-shell py-6 sm:py-8">
        <div className="mb-6 rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(121,56,31,0.08),rgba(39,63,49,0.1))] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="section-label">Cloud kitchen</p>
              <h1 className="section-title mt-2">Fresh meals, separate from the wholesale flow</h1>
              <p className="section-copy mt-2 max-w-3xl">
                Select a delivery address, unlock the eligible kitchen, then order ready-to-eat food without touching the wholesale cart or order tables.
              </p>
            </div>
            <FoodCartIndicator />
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-[0.82rem]">
            {[
              { href: "/food", label: "Overview" },
              { href: "/food/location", label: "Select location" },
              { href: "/food/menu", label: "Menu" },
              { href: "/food/cart", label: "Cart" },
              { href: "/food/checkout", label: "Checkout" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex h-10 items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        {children}
      </div>
    </FoodCartProvider>
  );
}

