"use client";

import { ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { getDisplayedPriceVatLabel } from "@/lib/product-pricing";
import { type PricingMode } from "@/lib/user-roles";
import { formatCurrency } from "@/lib/utils";

type ProductCardVariant = {
  id: string;
  name: string;
  sku: string;
  normalPrice: number;
  wholesalePrice: number;
  minOrderQuantity: number;
  stockQuantity: number;
};

type ProductCardProduct = {
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
  variants: ProductCardVariant[];
  category: {
    name: string;
  };
};

export function ProductCardPurchaseControls({
  product,
  pricingMode,
}: {
  product: ProductCardProduct;
  pricingMode: PricingMode;
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
  const stockQuantity = selectedVariant?.stockQuantity ?? product.stockQuantity;
  const unitPrice =
    pricingMode === "wholesale"
      ? (selectedVariant?.wholesalePrice ?? product.wholesalePrice)
      : (selectedVariant?.normalPrice ?? product.normalPrice);
  const activeSku = selectedVariant?.sku ?? product.sku;
  const normalizedQuantity = Number.isFinite(quantity)
    ? Math.trunc(quantity)
    : minimumQuantity;
  const resolvedQuantity =
    stockQuantity > 0
      ? Math.min(stockQuantity, Math.max(minimumQuantity, normalizedQuantity))
      : 0;

  const disabled =
    product.productType === "VARIABLE"
      ? !selectedVariant || stockQuantity < minimumQuantity
      : stockQuantity < minimumQuantity;

  const availabilityLabel =
    stockQuantity > 0 ? `${stockQuantity} in stock` : "Out of stock";
  const vatLabel = getDisplayedPriceVatLabel(product.vatRate);
  const priceLabel = pricingMode === "wholesale" ? "Wholesale" : "Retail";
  const quantityInputId = `card-quantity-${product.id}-${selectedVariantId || "base"}`;
  const quantityInputLabel = `Quantity for ${product.name}${selectedVariant ? ` ${selectedVariant.name}` : ""}`;

  const updateQuantity = (nextQuantity: number) => {
    if (!Number.isFinite(nextQuantity)) {
      setQuantity(minimumQuantity);
      return;
    }

    setQuantity(nextQuantity);
  };

  return (
    <div className="space-y-2.5">
      {product.productType === "VARIABLE" ? (
        <div className="space-y-2">
          <label
            htmlFor={`card-option-${product.id}`}
            className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500"
          >
            {product.variantLabel || "Option"}
          </label>
          <Select
            id={`card-option-${product.id}`}
            value={selectedVariantId}
            onChange={(event) => {
              setSelectedVariantId(event.target.value);
              setMessage("");
            }}
            className="h-9 rounded-full text-sm"
          >
            {product.variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.name} | {formatCurrency(
                  pricingMode === "wholesale"
                    ? variant.wholesalePrice
                    : variant.normalPrice,
                )}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      {selectedVariant ? (
        <p className="min-h-[1.25rem] text-[11px] leading-5 text-slate-500">
          SKU {selectedVariant.sku} | {availabilityLabel}
          {pricingMode === "wholesale" ? ` | MOQ ${minimumQuantity}` : ""}
        </p>
      ) : product.productType === "VARIABLE" ? (
        <p className="min-h-[1.25rem] text-[11px] leading-5 text-rose-700">
          No active options are available for this product right now.
        </p>
      ) : (
        <p className="min-h-[1.25rem] text-[11px] leading-5 text-slate-500">
          SKU {product.sku} | {availabilityLabel}
          {pricingMode === "wholesale" ? ` | MOQ ${minimumQuantity}` : ""}
        </p>
      )}

      <div className="flex items-stretch gap-2">
        <div className="flex min-w-0 flex-1 flex-col justify-center rounded-[1rem] border border-[var(--brand)]/15 bg-[rgba(255,248,235,0.92)] px-3 py-2">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {priceLabel}
          </p>
          <p className="truncate font-heading text-base font-semibold text-slate-900">
            {formatCurrency(unitPrice)}
          </p>
          <p className="truncate text-[10px] uppercase tracking-[0.12em] text-slate-500">
            {vatLabel}
          </p>
        </div>

        <div className="flex w-[7.25rem] shrink-0 items-center rounded-full border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => updateQuantity(resolvedQuantity - 1)}
            disabled={disabled || resolvedQuantity <= minimumQuantity}
            className="inline-flex h-10 w-9 items-center justify-center text-lg font-semibold text-slate-600 transition hover:text-[var(--brand-dark)] disabled:cursor-not-allowed disabled:text-slate-300"
            aria-label={`Decrease quantity for ${product.name}`}
          >
            -
          </button>
          <input
            id={quantityInputId}
            type="number"
            inputMode="numeric"
            min={stockQuantity > 0 ? minimumQuantity : 0}
            max={Math.max(stockQuantity, minimumQuantity)}
            value={resolvedQuantity}
            onChange={(event) => {
              const nextQuantity = Number(event.target.value);
              updateQuantity(nextQuantity);
            }}
            aria-label={quantityInputLabel}
            className="h-10 min-w-0 flex-1 border-0 bg-transparent px-1 text-center text-sm font-semibold text-slate-900 outline-none"
          />
          <button
            type="button"
            onClick={() => updateQuantity(resolvedQuantity + 1)}
            disabled={disabled || resolvedQuantity >= stockQuantity}
            className="inline-flex h-10 w-9 items-center justify-center text-lg font-semibold text-slate-600 transition hover:text-[var(--brand-dark)] disabled:cursor-not-allowed disabled:text-slate-300"
            aria-label={`Increase quantity for ${product.name}`}
          >
            +
          </button>
        </div>

        <Button
          type="button"
          size="sm"
          disabled={disabled}
          className="h-10 w-10 shrink-0 px-0"
          onClick={() => {
            if (product.productType === "VARIABLE" && !selectedVariant) {
              setMessage(
                "Please choose an available option before adding this product to the cart.",
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
          <ShoppingCart className="h-4 w-4" />
          <span className="sr-only">Add {product.name} to cart</span>
        </Button>
      </div>

      {message ? (
        <p className="text-sm font-medium text-emerald-700">{message}</p>
      ) : null}
    </div>
  );
}
