"use client";

import { useMemo, useState } from "react";

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
  const isVariable = product.productType === "VARIABLE";
  const initialVariant = isVariable
    ? product.variants.find((variant) => variant.stockQuantity > 0) ?? product.variants[0] ?? null
    : null;
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariant?.id ?? "");
  const [quantity, setQuantity] = useState(
    pricingMode === "wholesale" ? (initialVariant?.minOrderQuantity ?? product.minOrderQuantity) : 1
  );

  const selectedVariant = useMemo(() => {
    if (!isVariable) {
      return null;
    }

    return product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0] ?? null;
  }, [isVariable, product.variants, selectedVariantId]);

  const minimumQuantity = pricingMode === "wholesale" ? (selectedVariant?.minOrderQuantity ?? product.minOrderQuantity) : 1;
  const stockQuantity = selectedVariant?.stockQuantity ?? product.stockQuantity;
  const unitPrice = pricingMode === "wholesale" ? (selectedVariant?.wholesalePrice ?? product.wholesalePrice) : (selectedVariant?.normalPrice ?? product.normalPrice);
  const activeSku = selectedVariant?.sku ?? product.sku;
  const resolvedQuantity = stockQuantity > 0 ? Math.min(stockQuantity, Math.max(minimumQuantity, Math.trunc(quantity || minimumQuantity))) : 0;
  const disabled = isVariable ? !selectedVariant || stockQuantity < minimumQuantity : stockQuantity < minimumQuantity;
  const vatLabel = getDisplayedPriceVatLabel(product.vatRate);

  return (
    <div className="space-y-3">
      {isVariable ? (
        <div>
          <label className="field-label">{product.variantLabel || "Option"}</label>
          <div role="radiogroup" aria-label={product.variantLabel || "Option"} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {product.variants.map((variant) => {
              const isSelected = selectedVariantId === variant.id;
              const isSoldOut = variant.stockQuantity <= 0;

              return (
                <button
                  key={variant.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={variant.name}
                  disabled={isSoldOut}
                  onClick={() => {
                    setSelectedVariantId(variant.id);
                    setQuantity(pricingMode === "wholesale" ? variant.minOrderQuantity : 1);
                    setMessage("");
                  }}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left transition",
                    isSelected
                      ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--foreground)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
                    isSoldOut ? "cursor-not-allowed opacity-50" : ""
                  )}
                >
                  <span className="block text-[0.82rem] font-medium leading-5">{variant.name}</span>
                  {isSoldOut ? <span className="mt-1 block text-[0.68rem] text-[var(--muted-foreground)]">Out of stock</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2">
          <p className="text-[0.72rem] text-[var(--muted-foreground)]">
            {pricingMode === "wholesale" ? "Wholesale total" : "Retail total"}
          </p>
          <p className="mt-0.5 text-base font-semibold text-[var(--foreground)]">{formatCurrency(unitPrice)}</p>
          <p className="text-[0.72rem] text-[var(--muted-foreground)]">{vatLabel}</p>
        </div>

        <div className="flex h-9 items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-1">
          <button
            type="button"
            onClick={() => setQuantity(resolvedQuantity - 1)}
            disabled={disabled || resolvedQuantity <= minimumQuantity}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-sm text-[var(--muted-foreground)] disabled:opacity-40"
          >
            -
          </button>
          <input
            type="number"
            min={stockQuantity > 0 ? minimumQuantity : 0}
            max={Math.max(stockQuantity, minimumQuantity)}
            value={resolvedQuantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="h-7 w-12 border-0 bg-transparent px-1 text-center text-[0.82rem] text-[var(--foreground)] outline-none"
          />
          <button
            type="button"
            onClick={() => setQuantity(resolvedQuantity + 1)}
            disabled={disabled || resolvedQuantity >= stockQuantity}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-sm text-[var(--muted-foreground)] disabled:opacity-40"
          >
            +
          </button>
        </div>

        <Button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (isVariable && !selectedVariant) {
              setMessage("Choose an option first.");
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

            setMessage("Added to cart.");
          }}
        >
          Add to cart
        </Button>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.78rem] text-[var(--muted-foreground)]">
        <span>{stockQuantity > 0 ? `${stockQuantity} units in stock` : "Out of stock"}</span>
        {showWholesalePrice ? <span>MOQ {minimumQuantity}</span> : null}
        <span>SKU {activeSku}</span>
      </div>

      {message ? <p className="text-[0.78rem] text-[var(--accent-dark)]">{message}</p> : null}
    </div>
  );
}
