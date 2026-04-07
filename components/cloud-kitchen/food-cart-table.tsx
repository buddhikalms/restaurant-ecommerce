"use client";

import Link from "next/link";

import { useFoodCart } from "@/components/providers/food-cart-provider";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function FoodCartTable({ kitchenName }: { kitchenName: string | null }) {
  const { items, subtotal, updateQuantity, removeItem, clearCart } =
    useFoodCart();

  if (!items.length) {
    return (
      <div className="surface-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Your food cart is empty
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Choose a delivery location and add ready-to-eat items to start your
          order.
        </p>
        <Link
          href="/food/location"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-[var(--brand)] px-4 text-[0.84rem] font-medium text-white transition hover:bg-[var(--brand-dark)]"
        >
          Choose location
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="surface-card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[0.72rem] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {items.map((item) => (
                <tr key={item.itemId}>
                  <td className="px-4 py-4 align-top">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          {item.name}
                        </p>
                        {item.itemType === "COMBO" ? (
                          <span className="inline-flex rounded-full bg-[rgba(184,107,87,0.12)] px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-[var(--brand-dark)]">
                            Combo
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-[0.72rem] text-[var(--muted-foreground)]">
                        {item.categoryName}
                      </p>
                      {item.itemType === "COMBO" && item.offerTitle ? (
                        <p className="mt-1 text-[0.72rem] text-[var(--muted-foreground)]">
                          {item.offerTitle}
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--foreground)]">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex h-9 items-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-1">
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded text-sm text-[var(--muted-foreground)]"
                        onClick={() =>
                          updateQuantity(item.itemId, item.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-[0.82rem] text-[var(--foreground)]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded text-sm text-[var(--muted-foreground)]"
                        onClick={() =>
                          updateQuantity(item.itemId, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-[var(--foreground)]">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      className="text-[0.8rem] text-[var(--danger)]"
                      onClick={() => removeItem(item.itemId)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="surface-card rounded-2xl p-4">
        <p className="section-label">Order summary</p>
        <p className="mt-2 text-[0.8rem] text-[var(--muted-foreground)]">
          {kitchenName ? `Ordering from ${kitchenName}` : "Selected kitchen"}
        </p>
        <div className="mt-4 space-y-2 text-[0.82rem] text-[var(--muted-foreground)]">
          {items.map((item) => (
            <div
              key={item.itemId}
              className="flex items-start justify-between gap-3"
            >
              <div>
                <span className="line-clamp-1">
                  {item.name} x {item.quantity}
                </span>
                {item.itemType === "COMBO" && item.offerTitle ? (
                  <p className="mt-1 text-[0.7rem]">{item.offerTitle}</p>
                ) : null}
              </div>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <div className="flex items-center justify-between text-sm text-[var(--foreground)]">
            <span>Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <p className="mt-2 text-[0.72rem] leading-5 text-[var(--muted-foreground)]">
            Delivery fees and minimum order checks are confirmed securely on
            checkout.
          </p>
          <Link
            href="/food/checkout"
            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-[var(--brand)] px-4 text-[0.84rem] font-medium text-white transition hover:bg-[var(--brand-dark)]"
          >
            <span className="text-white"> Continue to checkout</span>
          </Link>
          <Button
            type="button"
            variant="secondary"
            className="mt-2 w-full"
            onClick={clearCart}
          >
            Clear cart
          </Button>
        </div>
      </aside>
    </div>
  );
}
