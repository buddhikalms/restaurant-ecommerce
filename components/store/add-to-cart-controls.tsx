"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  hideNormalPrice = false,
}: {
  product: ProductCartShape;
  pricingMode: PricingMode;
  showWholesalePrice: boolean;
  hideNormalPrice?: boolean;
}) {
  const { addItem } = useCart();
  const [message, setMessage] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? "",
  );
  const [quantity, setQuantity] = useState(
    pricingMode === "wholesale" ? product.minOrderQuantity : 1,
  );

  const selectedVariant = useMemo(() => {
    if (product.productType !== "VARIABLE") {
      return null;
    }

    return (
      product.variants.find((variant) => variant.id === selectedVariantId) ??
      product.variants[0] ??
      null
    );
  }, [product.productType, product.variants, selectedVariantId]);

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
  const resolvedQuantity = Math.min(
    stockQuantity,
    Math.max(minimumQuantity, Math.trunc(quantity)),
  );

  const disabled =
    product.productType === "VARIABLE"
      ? !selectedVariant || stockQuantity < minimumQuantity
      : stockQuantity < minimumQuantity;
  const showNormalPrice = !hideNormalPrice;
  const summaryGridClass = showWholesalePrice
    ? showNormalPrice
      ? "sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"
      : "sm:grid-cols-2"
    : "sm:grid-cols-1";
  const helperText = useMemo(() => {
    if (product.productType === "VARIABLE") {
      const optionLabel = product.variantLabel?.toLowerCase() || "option";
      const selectedLabel = selectedVariant?.name
        ? `Selected ${optionLabel}: ${selectedVariant.name}. `
        : "";

      if (showWholesalePrice) {
        return `${selectedLabel}Wholesale pricing updates per ${optionLabel}, with minimum quantities based on the option you choose.`;
      }

      return `${selectedLabel}Retail pricing is active. Create a wholesale account to unlock wholesale pricing for each ${optionLabel}.`;
    }

    if (showWholesalePrice) {
      return `Wholesale pricing active at ${formatCurrency(unitPrice)} with a minimum order quantity of ${product.minOrderQuantity} units.`;
    }

    return `Retail pricing is active at ${formatCurrency(unitPrice)}. Create a wholesale account to unlock wholesale pricing and bulk minimums.`;
  }, [
    product.minOrderQuantity,
    product.productType,
    product.variantLabel,
    selectedVariant,
    showWholesalePrice,
    unitPrice,
  ]);

  return (
    <div className="space-y-4">
      {product.productType === "VARIABLE" ? (
        <div className="rounded-[1.7rem] border border-slate-200 bg-[rgba(255,250,242,0.86)] p-4">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="mb-3 block text-sm font-semibold text-slate-700">
                {product.variantLabel || "Option"}
              </p>
              <div className="space-y-3">
                {product.variants.map((variant) => {
                  const isSelected = variant.id === selectedVariantId;
                  const visiblePrice = showWholesalePrice
                    ? variant.wholesalePrice
                    : variant.normalPrice;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        setMessage("");
                      }}
                      className={cn(
                        "w-full rounded-[1.35rem] border p-4 text-left transition",
                        isSelected
                          ? "border-[#4a2a0a] bg-[var(--brand-dark)] text-[#fff4df] shadow-[0_18px_34px_rgba(74,42,10,0.2)]"
                          : "border-white/80 bg-white text-slate-900 hover:border-[var(--brand)]/35 hover:bg-[#fff8ef]",
                      )}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "text-sm font-semibold",
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
                            {isSelected
                              ? "Selected"
                              : product.variantLabel || "Option"}
                          </span>
                          <p
                            className={cn(
                              "font-heading text-xl font-semibold",
                              isSelected ? "text-white" : "text-slate-900",
                            )}
                          >
                            {formatCurrency(visiblePrice)}
                          </p>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm",
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
                            : "Retail pricing active"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedVariant ? (
                <p className="mt-3 text-xs uppercase tracking-[0.14em] text-slate-500">
                  SKU {selectedVariant.sku} | {selectedVariant.stockQuantity}{" "}
                  units in stock
                </p>
              ) : (
                <p className="mt-3 text-sm text-rose-700">
                  No active options are available for this product right now.
                </p>
              )}
            </div>

            {selectedVariant ? (
              <div className={`grid gap-3 ${summaryGridClass}`}>
                {showNormalPrice ? (
                  <div className="rounded-[1.25rem] border border-white/80 bg-white p-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      price
                    </p>
                    <p className="mt-2 font-heading text-xl font-semibold text-slate-900">
                      {formatCurrency(selectedVariant.normalPrice)}
                    </p>
                  </div>
                ) : null}
                {showWholesalePrice ? (
                  <>
                    <div className="rounded-[1.25rem] border border-white/80 bg-white p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                        Wholesale price
                      </p>
                      <p className="mt-2 font-heading text-xl font-semibold text-slate-900">
                        {formatCurrency(selectedVariant.wholesalePrice)}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/80 bg-white p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                        Wholesale MOQ
                      </p>
                      <p className="mt-2 font-heading text-xl font-semibold text-slate-900">
                        {selectedVariant.minOrderQuantity}
                      </p>
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label
            htmlFor={`quantity-${product.id}-${selectedVariantId || "base"}`}
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Quantity
          </label>
          <Input
            id={`quantity-${product.id}-${selectedVariantId || "base"}`}
            type="number"
            min={minimumQuantity}
            max={stockQuantity}
            value={resolvedQuantity}
            onChange={(event) => {
              const nextQuantity = Number(event.target.value);
              setQuantity(
                Number.isFinite(nextQuantity) ? nextQuantity : minimumQuantity,
              );
            }}
          />
        </div>
        <Button
          type="button"
          disabled={disabled}
          className="min-w-36"
          onClick={() => {
            if (product.productType === "VARIABLE" && !selectedVariant) {
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
          }}
        >
          Add to cart
        </Button>
      </div>
      <p className="text-sm text-slate-500">{helperText}</p>
      {!showWholesalePrice ? (
        <Link
          href="/wholesale/register"
          className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--brand)]/25 bg-[rgba(255,248,235,0.95)] px-4 text-sm font-semibold text-[var(--brand-dark)] transition hover:bg-white"
        >
          Create wholesale account
        </Link>
      ) : null}
      {message ? (
        <p className="text-sm font-medium text-emerald-700">{message}</p>
      ) : null}
    </div>
  );
}
