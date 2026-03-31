"use client";

import { ShoppingCart } from "lucide-react";
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
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(pricingMode === "wholesale" ? product.minOrderQuantity : 1);

  const selectedVariant = useMemo(() => {
    if (product.productType !== "VARIABLE") {
      return null;
    }

    return product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0] ?? null;
  }, [product.productType, product.variants, selectedVariantId]);

  const minimumQuantity = pricingMode === "wholesale" ? (selectedVariant?.minOrderQuantity ?? product.minOrderQuantity) : 1;
  const stockQuantity = selectedVariant?.stockQuantity ?? product.stockQuantity;
  const unitPrice = pricingMode === "wholesale" ? (selectedVariant?.wholesalePrice ?? product.wholesalePrice) : (selectedVariant?.normalPrice ?? product.normalPrice);
  const activeSku = selectedVariant?.sku ?? product.sku;
  const resolvedQuantity = stockQuantity > 0 ? Math.min(stockQuantity, Math.max(minimumQuantity, Math.trunc(quantity || minimumQuantity))) : 0;
  const disabled = product.productType === "VARIABLE" ? !selectedVariant || stockQuantity < minimumQuantity : stockQuantity < minimumQuantity;

  return (
    <div className="space-y-2">
      {product.productType === "VARIABLE" ? (
        <Select
          value={selectedVariantId}
          onChange={(event) => {
            setSelectedVariantId(event.target.value);
            setQuantity(pricingMode === "wholesale" ? (product.variants.find((variant) => variant.id === event.target.value)?.minOrderQuantity ?? product.minOrderQuantity) : 1);
            setMessage("");
          }}
          className="h-8 text-[0.78rem]"
        >
          {product.variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.name}
            </option>
          ))}
        </Select>
      ) : null}

      <div className="flex items-center gap-2">
        <div className="flex h-8 items-center rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-1">
          <button
            type="button"
            onClick={() => setQuantity(resolvedQuantity - 1)}
            disabled={disabled || resolvedQuantity <= minimumQuantity}
            className="inline-flex h-6 w-6 items-center justify-center rounded text-[0.9rem] text-[var(--muted-foreground)] disabled:opacity-40"
          >
            -
          </button>
          <input
            type="number"
            min={stockQuantity > 0 ? minimumQuantity : 0}
            max={Math.max(stockQuantity, minimumQuantity)}
            value={resolvedQuantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="h-6 w-10 border-0 bg-transparent px-1 text-center text-[0.78rem] text-[var(--foreground)] outline-none"
          />
          <button
            type="button"
            onClick={() => setQuantity(resolvedQuantity + 1)}
            disabled={disabled || resolvedQuantity >= stockQuantity}
            className="inline-flex h-6 w-6 items-center justify-center rounded text-[0.9rem] text-[var(--muted-foreground)] disabled:opacity-40"
          >
            +
          </button>
        </div>

        <Button
          type="button"
          size="sm"
          disabled={disabled}
          className="flex-1"
          onClick={() => {
            if (product.productType === "VARIABLE" && !selectedVariant) {
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
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>Add</span>
        </Button>
      </div>

      <div className="flex items-center justify-between text-[0.72rem] text-[var(--muted-foreground)]">
        <span>{formatCurrency(unitPrice)}</span>
        <span>{stockQuantity > 0 ? `${stockQuantity} in stock` : "Out of stock"}</span>
      </div>

      {message ? <p className="text-[0.72rem] text-[var(--accent-dark)]">{message}</p> : null}
    </div>
  );
}
