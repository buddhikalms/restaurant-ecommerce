import Link from "next/link";

import { FoodCartIndicator } from "@/components/cloud-kitchen/food-cart-indicator";
import { FoodCartProvider } from "@/components/providers/food-cart-provider";
import { getFoodLocationSession } from "@/lib/cloud-kitchen/location-session";

export default async function FoodLayout({ children }: { children: React.ReactNode }) {
  const selection = await getFoodLocationSession();
  const activeKitchenId = selection?.kitchenId ?? null;

  return (
    <FoodCartProvider activeKitchenId={activeKitchenId}>
      <div className="border-b border-[var(--border)] bg-[rgba(255,255,255,0.82)] backdrop-blur">
        <div className="page-shell py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand-dark)]">
                Cloud kitchen
              </p>
              <h1 className="mt-2 text-[1.25rem] font-semibold text-[var(--foreground)]">
                Delivery-first ordering
              </h1>
              <p className="mt-1 text-[0.82rem] text-[var(--muted-foreground)]">
                Menu browsing, basket flow, and checkout now live under the food storefront.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { href: "/food", label: "Overview" },
                { href: "/food/location", label: "Location" },
                { href: "/food/menu", label: "Menu" },
                { href: "/food/cart", label: "Cart" },
                { href: "/food/checkout", label: "Checkout" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex h-10 items-center rounded-full border border-[var(--border)] bg-white px-4 text-[0.8rem] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
                >
                  {item.label}
                </Link>
              ))}
              <FoodCartIndicator />
            </div>
          </div>
        </div>
      </div>

      <div className="page-shell py-6 sm:py-8">{children}</div>
    </FoodCartProvider>
  );
}
