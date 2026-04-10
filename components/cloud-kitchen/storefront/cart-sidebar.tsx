import Link from "next/link";
import { Minus, Percent, Plus, Ticket, Trash2 } from "lucide-react";

import type { FoodCartItem } from "@/components/providers/food-cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";

export function CartSidebar({
  items,
  subtotal,
  deliveryFee,
  tax,
  discount,
  total,
  minimumOrder,
  orderTypeLabel,
  branchName,
  scheduleLabel,
  promoValue,
  onPromoValueChange,
  onApplyPromo,
  promoMessage,
  appliedPromoLabel,
  onUpdateQuantity,
  onRemove,
  onClearCart,
  canCheckout,
  checkoutHref,
  checkoutLabel,
  checkoutHelper,
  showPromoCodes,
  className,
}: {
  items: FoodCartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  minimumOrder: number;
  orderTypeLabel: string;
  branchName: string;
  scheduleLabel: string;
  promoValue: string;
  onPromoValueChange: (value: string) => void;
  onApplyPromo: () => void;
  promoMessage: string | null;
  appliedPromoLabel: string | null;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onClearCart: () => void;
  canCheckout: boolean;
  checkoutHref: string;
  checkoutLabel: string;
  checkoutHelper?: string | null;
  showPromoCodes: boolean;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "rounded-[1.85rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-label">Basket</p>
          <h2 className="section-subtitle mt-2">Your order</h2>
          <p className="section-copy mt-2">
            {branchName} | {orderTypeLabel} | {scheduleLabel}
          </p>
        </div>
        {items.length ? (
          <button
            type="button"
            onClick={onClearCart}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--muted-foreground)] transition hover:bg-white"
            aria-label="Clear cart"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {items.length ? (
        <>
          <div className="mt-5 space-y-3">
            {items.map((item) => (
              <div
                key={item.itemId}
                className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-muted)] p-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                        {item.name}
                      </p>
                      {item.brandName ? (
                        <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[0.68rem] font-medium text-[var(--muted-foreground)]">
                          {item.brandName}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[0.74rem] text-[var(--muted-foreground)]">
                      {item.categoryName}
                    </p>
                    {item.variantLabel ? (
                      <p className="mt-2 text-[0.76rem] text-[var(--foreground)]">
                        {item.variantLabel}
                      </p>
                    ) : null}
                    {item.customizations.length ? (
                      <p className="mt-1 text-[0.74rem] leading-5 text-[var(--muted-foreground)]">
                        {item.customizations.join(" | ")}
                      </p>
                    ) : null}
                    {item.instructions ? (
                      <p className="mt-1 text-[0.74rem] italic text-[var(--muted-foreground)]">
                        &quot;{item.instructions}&quot;
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(item.itemId)}
                    className="text-[0.76rem] font-medium text-[var(--danger)]"
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex h-10 items-center rounded-full border border-[var(--border)] bg-white px-1">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.itemId, item.quantity - 1)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted-foreground)] transition hover:bg-[var(--surface-muted)]"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-[var(--foreground)]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.itemId, item.quantity + 1)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted-foreground)] transition hover:bg-[var(--surface-muted)]"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {showPromoCodes ? (
            <div className="mt-5 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <label className="field-label">Promo code</label>
              <div className="flex gap-2">
                <Input
                  value={promoValue}
                  onChange={(event) => onPromoValueChange(event.target.value)}
                  placeholder="SAVE10"
                  className="h-11 rounded-xl bg-white"
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 rounded-xl"
                  onClick={onApplyPromo}
                >
                  <Ticket className="h-4 w-4" />
                  Apply
                </Button>
              </div>
              {promoMessage ? (
                <p className="mt-2 text-[0.76rem] text-[var(--muted-foreground)]">
                  {promoMessage}
                </p>
              ) : null}
              {appliedPromoLabel ? (
                <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[0.72rem] font-medium text-[var(--brand-dark)]">
                  <Percent className="h-3.5 w-3.5" />
                  {appliedPromoLabel}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-5 space-y-3 rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
            <Row label="Subtotal" value={formatCurrency(subtotal)} />
            <Row
              label={orderTypeLabel === "Delivery" ? "Delivery fee" : "Service fee"}
              value={formatCurrency(deliveryFee)}
            />
            {tax > 0 ? <Row label="Tax" value={formatCurrency(tax)} /> : null}
            {discount > 0 ? (
              <Row label="Discount" value={`-${formatCurrency(discount)}`} />
            ) : null}
            <div className="border-t border-[var(--border)] pt-3">
              <Row label="Total" value={formatCurrency(total)} strong />
            </div>
            {!canCheckout ? (
              <p className="rounded-xl bg-[rgba(214,162,71,0.14)] px-3 py-2 text-[0.78rem] text-[#7b5817]">
                Add {formatCurrency(Math.max(minimumOrder - subtotal, 0))} more to reach the
                minimum order.
              </p>
            ) : null}
            {checkoutHelper ? (
              <p className="rounded-xl bg-[var(--surface-muted)] px-3 py-2 text-[0.76rem] text-[var(--muted-foreground)]">
                {checkoutHelper}
              </p>
            ) : null}
            <Link
              href={checkoutHref}
              aria-disabled={!items.length}
              className={cn(
                "inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--brand)] px-4 text-[0.84rem] font-medium text-white transition hover:bg-[var(--brand-dark)]",
                !items.length && "pointer-events-none opacity-60",
              )}
            >
              {checkoutLabel}
            </Link>
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-[1.5rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] px-5 py-8 text-center">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Your basket is empty</h3>
          <p className="mt-2 text-[0.82rem] leading-6 text-[var(--muted-foreground)]">
            Open any menu item to add quantity, preferences, and kitchen notes before checkout.
          </p>
        </div>
      )}
    </aside>
  );
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={cn(
          "text-[0.82rem] text-[var(--muted-foreground)]",
          strong && "text-sm font-semibold text-[var(--foreground)]",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-[0.82rem] text-[var(--foreground)]",
          strong && "text-sm font-semibold",
        )}
      >
        {value}
      </span>
    </div>
  );
}
