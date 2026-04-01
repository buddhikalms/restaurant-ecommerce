"use client";

import Link from "next/link";

import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { RemoteImage } from "@/components/ui/remote-image";
import { formatCurrency } from "@/lib/utils";

export function CartTable() {
  const {
    items,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
    pricingMode,
  } = useCart();
  const pricingLabel = pricingMode === "wholesale" ? "Wholesale" : "Retail";

  if (!items.length) {
    return (
      <div className="surface-card rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Your cart is empty</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add products to start building your order.
        </p>
        <Link
          href="/products"
          className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-[var(--brand)] px-3.5 text-[0.84rem] font-medium text-white transition hover:bg-[var(--brand-dark)]"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="surface-card overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[0.72rem] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {items.map((item) => (
                <tr key={item.itemId}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <RemoteImage
                        src={item.imageUrl}
                        alt={item.name}
                        width={72}
                        height={72}
                        className="h-14 w-14 rounded-md object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">{item.name}</p>
                        {item.variantName ? <p className="text-[0.72rem] text-[var(--muted-foreground)]">{item.variantName}</p> : null}
                        <p className="text-[0.72rem] text-[var(--muted-foreground)]">{item.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--foreground)]">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-4">
                    <div className="flex h-8 items-center rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-1">
                      <button
                        className="inline-flex h-6 w-6 items-center justify-center rounded text-sm text-[var(--muted-foreground)]"
                        onClick={() => updateQuantity(item.itemId, item.quantity - item.minimumQuantity)}
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-[0.82rem] text-[var(--foreground)]">{item.quantity}</span>
                      <button
                        className="inline-flex h-6 w-6 items-center justify-center rounded text-sm text-[var(--muted-foreground)]"
                        onClick={() => updateQuantity(item.itemId, item.quantity + item.minimumQuantity)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-[var(--foreground)]">{formatCurrency(item.unitPrice * item.quantity)}</td>
                  <td className="px-4 py-4">
                    <button className="text-[0.8rem] text-[var(--danger)]" onClick={() => removeItem(item.itemId)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="surface-card rounded-lg p-4">
        <p className="section-label">{pricingLabel} summary</p>
        <div className="mt-3 space-y-2 text-[0.82rem] text-[var(--muted-foreground)]">
          {items.map((item) => (
            <div key={item.itemId} className="flex items-center justify-between gap-3">
              <span className="line-clamp-1">{item.name}</span>
              <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <div className="flex items-center justify-between text-sm text-[var(--foreground)]">
            <span>Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <p className="mt-2 text-[0.72rem] leading-5 text-[var(--muted-foreground)]">
            Shipping is confirmed after review.
          </p>
          <Link
            href="/checkout"
            className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-lg bg-[var(--brand)] px-3.5 text-[0.84rem] font-medium text-white transition hover:bg-[var(--brand-dark)]"
          >
            <span className="text-white">Continue to checkout</span>
          </Link>
          <Button type="button" variant="secondary" className="mt-2 w-full" onClick={clearCart}>
            Clear cart
          </Button>
        </div>
      </aside>
    </div>
  );
}
