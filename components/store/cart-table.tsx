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
      <div className="surface-card rounded-[2rem] border border-white/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <h2 className="font-heading text-2xl font-semibold text-slate-900">
          Your cart is empty
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {pricingMode === "wholesale"
            ? "Add wholesale products to build your next replenishment order."
            : "Add products to build your next order."}
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-dark)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
        >
          <span className="text-white">Browse products</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="surface-card overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-[#f9f4ea] text-left text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Unit price</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Line total</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
              {items.map((item) => (
                <tr key={item.itemId}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <RemoteImage
                        src={item.imageUrl}
                        alt={item.name}
                        width={128}
                        height={128}
                        className="h-16 w-16 rounded-2xl object-cover"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.name}
                        </p>
                        {item.variantName ? (
                          <p className="text-xs uppercase tracking-[0.14em] text-[var(--brand-dark)]">
                            {item.variantName}
                          </p>
                        ) : null}
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                          {item.sku}
                        </p>
                        <p className="text-xs text-slate-500">
                          {pricingMode === "wholesale"
                            ? `Wholesale MOQ ${item.minimumQuantity}`
                            : `${pricingLabel} pricing`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
                      <button
                        className="h-8 w-8 rounded-full bg-white text-lg font-medium text-slate-700"
                        onClick={() =>
                          updateQuantity(
                            item.itemId,
                            item.quantity - item.minimumQuantity,
                          )
                        }
                      >
                        -
                      </button>
                      <span className="min-w-12 text-center font-semibold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        className="h-8 w-8 rounded-full bg-white text-lg font-medium text-slate-700"
                        onClick={() =>
                          updateQuantity(
                            item.itemId,
                            item.quantity + item.minimumQuantity,
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="text-sm font-semibold text-rose-600"
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

      <aside className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {pricingLabel} order summary
        </p>
        <div className="mt-6 space-y-4 text-sm text-slate-600">
          {items.map((item) => (
            <div
              key={item.itemId}
              className="flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-medium text-slate-900">{item.name}</p>
                {item.variantName ? (
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    {item.variantName}
                  </p>
                ) : null}
                <p>{item.quantity} units</p>
              </div>
              <p className="font-semibold text-slate-900">
                {formatCurrency(item.unitPrice * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {pricingMode === "wholesale"
              ? "Shipping will be coordinated after order review. Final invoicing reflects confirmed availability."
              : "Shipping and taxes are finalized after order review and confirmation."}
          </p>
          <Link
            href="/checkout"
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--brand-dark)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
          >
            <span className="text-white"> Continue to checkout</span>
          </Link>
          <Button
            type="button"
            variant="secondary"
            className="mt-3 w-full"
            onClick={clearCart}
          >
            Clear cart
          </Button>
        </div>
      </aside>
    </div>
  );
}
