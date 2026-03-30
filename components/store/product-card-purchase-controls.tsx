"use client";

import { useMemo, useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
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
  showWholesalePrice,
}: {
  product: ProductCardProduct;
  pricingMode: PricingMode;
  showWholesalePrice: boolean;
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
  const resolvedQuantity = Math.min(
    stockQuantity,
    Math.max(minimumQuantity, Math.trunc(quantity)),
  );

  const disabled =
    product.productType === "VARIABLE"
      ? !selectedVariant || stockQuantity < minimumQuantity
      : stockQuantity < minimumQuantity;

  const availabilityLabel =
    stockQuantity > 0 ? `${stockQuantity} in stock` : "Out of stock";
  const priceSummary = `${formatCurrency(unitPrice)} each${
    showWholesalePrice ? ` | MOQ ${minimumQuantity}` : ""
  }`;

  const updateQuantity = (nextQuantity: number) => {
    if (!Number.isFinite(nextQuantity)) {
      setQuantity(minimumQuantity);
      return;
    }

    setQuantity(nextQuantity);
  };

  return (
    <div className="space-y-3">
      {product.productType === "VARIABLE" ? (
        <div className="space-y-2">
          <label
            htmlFor={`card-option-${product.id}`}
            className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
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
            className="h-10 rounded-full text-sm"
          >
            {product.variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.name} |{" "}
                {formatCurrency(
                  pricingMode === "wholesale"
                    ? variant.wholesalePrice
                    : variant.normalPrice,
                )}
              </option>
            ))}
          </Select>
          {selectedVariant ? (
            <p className="text-xs leading-5 text-slate-500">
              SKU {selectedVariant.sku} | {availabilityLabel}
            </p>
          ) : (
            <p className="text-xs leading-5 text-rose-700">
              No active options are available for this product right now.
            </p>
          )}
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor={`card-quantity-${product.id}-${selectedVariantId || "base"}`}
            className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
          >
            Quantity
          </label>
          <p className="text-xs font-medium text-slate-500">{priceSummary}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center rounded-full border border-slate-200 bg-white shadow-sm">
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
              id={`card-quantity-${product.id}-${selectedVariantId || "base"}`}
              type="number"
              min={minimumQuantity}
              max={stockQuantity}
              value={resolvedQuantity}
              onChange={(event) => {
                const nextQuantity = Number(event.target.value);
                updateQuantity(nextQuantity);
              }}
              className="h-11 min-w-0 flex-1 border-0 bg-transparent px-1 text-center text-sm font-semibold text-slate-900 outline-none"
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
            className="min-w-[8.5rem]"
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
            Add to cart
          </Button>
        </div>
      </div>

      {message ? (
        <p className="text-sm font-medium text-emerald-700">{message}</p>
      ) : null}
    </div>
  );
}


