"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { getDisplayedPriceVatLabel } from "@/lib/product-pricing";
import { type PricingMode } from "@/lib/user-roles";
import { cn, formatCurrency } from "@/lib/utils";

type ProductCartVariantShape = {
  id: string;
  name: string;
  sku: string;
  normalPrice: number;
  wholesalePrice: number;
  minOrderQuantity: number;
  stockQuantity: number;
};

type ProductCartShape = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  imageUrl: string;
  productType: "SIMPLE" | "VARIABLE";
  variantLabel: string | null;
  vatRate: number;
  normalPrice: number;
  wholesalePrice: number;
  minOrderQuantity: number;
  stockQuantity: number;
  variants: ProductCartVariantShape[];
  category: {
    name: string;
  };
};

export function AddToCartControls({
  product,
  pricingMode,
  showWholesalePrice,
}: {
  product: ProductCartShape;
  pricingMode: PricingMode;
  showWholesalePrice: boolean;
  hideNormalPrice?: boolean;
}) {
  const { addItem } = useCart();
  const [message, setMessage] = useState("");
  const [isVariantPickerOpen, setIsVariantPickerOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? "",
  );
  const [quantity, setQuantity] = useState(
    pricingMode === "wholesale" ? product.minOrderQuantity : 1,
  );
  const vatLabel = getDisplayedPriceVatLabel(product.vatRate);
  const isVariable = product.productType === "VARIABLE";
  const optionLabel = product.variantLabel?.toLowerCase() || "option";

  const selectedVariant = useMemo(() => {
    if (!isVariable) {
      return null;
    }

    return (
      product.variants.find((variant) => variant.id === selectedVariantId) ??
      product.variants[0] ??
      null
    );
  }, [isVariable, product.variants, selectedVariantId]);

  const minimumQuantity =
    pricingMode === "wholesale"
      ? (selectedVariant?.minOrderQuantity ?? product.minOrderQuantity)
      : 1;
  const unitPrice =
    pricingMode === "wholesale"
      ? (selectedVariant?.wholesalePrice ?? product.wholesalePrice)
      : (selectedVariant?.normalPrice ?? product.normalPrice);
  const stockQuantity = selectedVariant?.stockQuantity ?? product.stockQuantity;
  const activeSku = selectedVariant?.sku ?? product.sku;
  const normalizedQuantity = Number.isFinite(quantity)
    ? Math.trunc(quantity)
    : minimumQuantity;
  const resolvedQuantity =
    stockQuantity > 0
      ? Math.min(stockQuantity, Math.max(minimumQuantity, normalizedQuantity))
      : 0;

  const disabled = isVariable
    ? !selectedVariant || stockQuantity < minimumQuantity
    : stockQuantity < minimumQuantity;
  const priceLabel =
    pricingMode === "wholesale" ? "Wholesale total" : "Retail total";
  const availabilityLabel =
    stockQuantity > 0 ? `${stockQuantity} units in stock` : "Out of stock";
  const helperText = useMemo(() => {
    if (isVariable) {
      const selectedLabel = selectedVariant?.name
        ? `Selected ${optionLabel}: ${selectedVariant.name}. `
        : "";

      if (showWholesalePrice) {
        return `${selectedLabel}Open the full-screen ${optionLabel} popup, choose the exact variation you want, then use the main quantity and add-to-cart row below. ${vatLabel} is already reflected.`;
      }

      return `${selectedLabel}Open the full-screen ${optionLabel} popup, choose the exact variation you want, then use the main quantity and add-to-cart row below.`;
    }

    if (showWholesalePrice) {
      return `Wholesale pricing is active for this product, with a minimum order quantity of ${product.minOrderQuantity} units.`;
    }

    return "Retail pricing is active. Create a wholesale account to unlock wholesale pricing and bulk minimums.";
  }, [
    isVariable,
    optionLabel,
    product.minOrderQuantity,
    selectedVariant,
    showWholesalePrice,
    vatLabel,
  ]);

  useEffect(() => {
    if (!isVariable || !isVariantPickerOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsVariantPickerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVariable, isVariantPickerOpen]);

  useEffect(() => {
    if (stockQuantity <= 0) {
      setQuantity(0);
      return;
    }

    setQuantity((currentQuantity) => {
      const nextQuantity = Number.isFinite(currentQuantity)
        ? Math.trunc(currentQuantity)
        : minimumQuantity;

      return Math.min(stockQuantity, Math.max(minimumQuantity, nextQuantity));
    });
  }, [minimumQuantity, stockQuantity]);

  const updateQuantity = (nextQuantity: number) => {
    if (!Number.isFinite(nextQuantity)) {
      setQuantity(minimumQuantity);
      return;
    }

    setQuantity(nextQuantity);
  };

  const addCurrentSelectionToCart = () => {
    if (isVariable && !selectedVariant) {
      setMessage(
        "Please select an available option before adding this product to the cart.",
      );
      return;
    }

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      slug: product.slug,
      name: product.name,
      variantName: selectedVariant?.name ?? null,
      sku: activeSku,
      imageUrl: product.imageUrl,
      unitPrice,
      minimumQuantity,
      stockQuantity,
      categoryName: product.category.name,
      pricingMode,
      quantity: resolvedQuantity,
    });

    setMessage(
      `${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ""} added to cart.`,
    );
  };

  return (
    <div className="space-y-4">
      {isVariable ? (
        <>
          <div className="rounded-[1.7rem] border border-slate-200 bg-[rgba(255,250,242,0.86)] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {product.variantLabel || "Option"} selector
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Open the full-screen popup, choose the {optionLabel} you want,
                  and the main product row below will update automatically.
                </p>
              </div>
              <Button
                type="button"
                className="min-w-full sm:min-w-[16rem]"
                onClick={() => {
                  setIsVariantPickerOpen(true);
                  setMessage("");
                }}
              >
                {selectedVariant ? `Change ${optionLabel}` : `Choose ${optionLabel}`}
              </Button>
            </div>

            {selectedVariant ? (
              <div className="mt-4 rounded-[1.35rem] border border-white/80 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedVariant.name}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      SKU {selectedVariant.sku}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-heading text-2xl font-semibold text-slate-900">
                      {formatCurrency(unitPrice)}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      {vatLabel}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {availabilityLabel}
                  {showWholesalePrice ? ` | MOQ ${minimumQuantity}` : ""}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-rose-700">
                No active options are available for this product right now.
              </p>
            )}
          </div>

          {isVariantPickerOpen ? (
            <div
              className="fixed inset-0 z-50 bg-slate-950/80"
              onClick={() => setIsVariantPickerOpen(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="variant-picker-title"
                className="flex h-full w-full flex-col bg-[linear-gradient(180deg,#f7efe3_0%,#fffdf8_38%,#f3e8da_100%)] text-slate-900"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="border-b border-white/10 bg-[linear-gradient(120deg,rgba(17,12,9,0.98),rgba(34,22,15,0.96))] px-5 py-5 text-white sm:px-8 lg:px-10">
                  <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-4">
                    <div className="max-w-3xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f0c67a]">
                        {product.variantLabel || "Option"} popup
                      </p>
                      <h2
                        id="variant-picker-title"
                        className="mt-2 font-heading text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.02] text-white"
                      >
                        Choose {optionLabel} for {product.name}
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#f1e4cf] sm:text-base">
                        Select the variation you want. After you click it, the
                        main product panel will update and you can add it to cart
                        from the page.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsVariantPickerOpen(false)}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/14 bg-white/8 text-white transition hover:border-white/25 hover:bg-white/12"
                      aria-label="Close option popup"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="page-shell flex-1 overflow-y-auto py-6 sm:py-8 lg:py-10">
                  <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.6fr)]">
                    <div className="rounded-[1.9rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
                        How it works
                      </p>
                      <h3 className="mt-3 font-heading text-3xl font-semibold text-slate-900">
                        Pick the exact {optionLabel}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        This popup only loads the selected variation into the
                        main product panel. Quantity and add to cart stay on the
                        page after you choose.
                      </p>

                      {selectedVariant ? (
                        <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-[#fff9f0] p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
                            Currently loaded
                          </p>
                          <p className="mt-2 text-lg font-semibold text-slate-900">
                            {selectedVariant.name}
                          </p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                            SKU {selectedVariant.sku}
                          </p>
                          <p className="mt-3 font-heading text-2xl font-semibold text-slate-900">
                            {formatCurrency(unitPrice)}
                          </p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                            {vatLabel}
                          </p>
                          <p className="mt-3 text-sm text-slate-600">
                            {availabilityLabel}
                            {showWholesalePrice ? ` | MOQ ${minimumQuantity}` : ""}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
                      {product.variants.map((variant) => {
                        const isSelected = variant.id === selectedVariantId;
                        const visiblePrice =
                          pricingMode === "wholesale"
                            ? variant.wholesalePrice
                            : variant.normalPrice;

                        return (
                          <button
                            key={variant.id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => {
                              setSelectedVariantId(variant.id);
                              setIsVariantPickerOpen(false);
                              setMessage("");
                            }}
                            className={cn(
                              "w-full rounded-[1.5rem] border p-5 text-left transition",
                              isSelected
                                ? "border-[#4a2a0a] bg-[var(--brand-dark)] text-[#fff4df] shadow-[0_24px_48px_rgba(74,42,10,0.24)]"
                                : "border-white/80 bg-white text-slate-900 shadow-[0_16px_34px_rgba(15,23,42,0.06)] hover:border-[var(--brand)]/35 hover:bg-[#fff8ef]",
                            )}
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <p
                                  className={cn(
                                    "text-base font-semibold",
                                    isSelected ? "text-[#fff4df]" : "text-slate-900",
                                  )}
                                >
                                  {variant.name}
                                </p>
                                <p
                                  className={cn(
                                    "mt-1 text-[11px] uppercase tracking-[0.16em]",
                                    isSelected ? "text-[#f3d8ab]" : "text-slate-500",
                                  )}
                                >
                                  SKU {variant.sku}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                <span
                                  className={cn(
                                    "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                                    isSelected
                                      ? "bg-white/12 text-[#fff1d2]"
                                      : "bg-[#f8efe2] text-[var(--brand-dark)]",
                                  )}
                                >
                                  {isSelected ? "Loaded" : product.variantLabel || "Option"}
                                </span>
                                <p
                                  className={cn(
                                    "font-heading text-2xl font-semibold",
                                    isSelected ? "text-white" : "text-slate-900",
                                  )}
                                >
                                  {formatCurrency(visiblePrice)}
                                </p>
                              </div>
                            </div>
                            <div
                              className={cn(
                                "mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm",
                                isSelected ? "text-[#f0dfc2]" : "text-slate-600",
                              )}
                            >
                              <p>
                                {variant.stockQuantity > 0
                                  ? `${variant.stockQuantity} units in stock`
                                  : "Out of stock"}
                              </p>
                              <p>
                                {showWholesalePrice
                                  ? `MOQ ${variant.minOrderQuantity}`
                                  : vatLabel}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <div className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:flex-nowrap md:items-center">
          <div className="min-w-0 flex-1 rounded-[1.35rem] border border-[var(--brand)]/15 bg-[rgba(255,248,235,0.92)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {priceLabel}
            </p>
            <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1">
              <p className="font-heading text-2xl font-semibold text-slate-900">
                {formatCurrency(unitPrice)}
              </p>
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                {vatLabel}
              </p>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {showWholesalePrice
                ? `Minimum ${minimumQuantity} units | ${availabilityLabel}`
                : availabilityLabel}
            </p>
          </div>

          <div className="flex w-full max-w-[11rem] shrink-0 items-center rounded-full border border-slate-200 bg-[rgba(255,255,255,0.96)] shadow-sm">
            <button
              type="button"
              onClick={() => updateQuantity(resolvedQuantity - 1)}
              disabled={disabled || resolvedQuantity <= minimumQuantity}
              className="inline-flex h-11 w-11 items-center justify-center text-lg font-semibold text-slate-600 transition hover:text-[var(--brand-dark)] disabled:cursor-not-allowed disabled:text-slate-300"
              aria-label={`Decrease quantity for ${product.name}`}
            >
              -
            </button>
            <input
              id={`quantity-${product.id}-${selectedVariantId || "base"}`}
              type="number"
              inputMode="numeric"
              min={stockQuantity > 0 ? minimumQuantity : 0}
              max={Math.max(stockQuantity, minimumQuantity)}
              value={resolvedQuantity}
              onChange={(event) => {
                const nextQuantity = Number(event.target.value);
                updateQuantity(nextQuantity);
              }}
              className="h-11 min-w-0 flex-1 border-0 bg-transparent px-1 text-center text-sm font-semibold text-slate-900 outline-none"
              aria-label={`Quantity for ${product.name}${selectedVariant ? ` ${selectedVariant.name}` : ""}`}
            />
            <button
              type="button"
              onClick={() => updateQuantity(resolvedQuantity + 1)}
              disabled={disabled || resolvedQuantity >= stockQuantity}
              className="inline-flex h-11 w-11 items-center justify-center text-lg font-semibold text-slate-600 transition hover:text-[var(--brand-dark)] disabled:cursor-not-allowed disabled:text-slate-300"
              aria-label={`Increase quantity for ${product.name}`}
            >
              +
            </button>
          </div>

          <Button
            type="button"
            disabled={disabled}
            className="min-w-full md:min-w-[11rem]"
            onClick={addCurrentSelectionToCart}
          >
            Add to cart
          </Button>
        </div>

        {message ? (
          <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p>
        ) : null}
      </div>

      <p className="text-sm text-slate-500">{helperText}</p>
    </div>
  );
}
