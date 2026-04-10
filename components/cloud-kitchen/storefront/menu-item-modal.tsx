"use client";

import { Minus, Plus, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import type { FoodCartInput } from "@/components/providers/food-cart-provider";
import { Button } from "@/components/ui/button";
import { RemoteImage } from "@/components/ui/remote-image";
import { Textarea } from "@/components/ui/textarea";
import type { StorefrontProduct } from "@/lib/data/cloud-kitchen-storefront";
import { cn, formatCurrency } from "@/lib/utils";

export function MenuItemModal({
  kitchenId,
  product,
  categoryName,
  brandName,
  onClose,
  onAddToCart,
}: {
  kitchenId: string;
  product: StorefrontProduct | null;
  categoryName: string;
  brandName: string;
  onClose: () => void;
  onAddToCart: (item: FoodCartInput) => void;
}) {
  if (!product) {
    return null;
  }

  return (
    <MenuItemModalContent
      key={product.id}
      kitchenId={kitchenId}
      product={product}
      categoryName={categoryName}
      brandName={brandName}
      onClose={onClose}
      onAddToCart={onAddToCart}
    />
  );
}

function MenuItemModalContent({
  kitchenId,
  product,
  categoryName,
  brandName,
  onClose,
  onAddToCart,
}: {
  kitchenId: string;
  product: StorefrontProduct;
  categoryName: string;
  brandName: string;
  onClose: () => void;
  onAddToCart: (item: FoodCartInput) => void;
}) {
  const descriptionId = useId();
  const [quantity, setQuantity] = useState(1);
  const [selectedSingles, setSelectedSingles] = useState<Record<string, string>>(() => {
    const nextSingles: Record<string, string> = {};

    for (const group of product.optionGroups) {
      if (group.selection === "single" && group.required && group.options[0]) {
        nextSingles[group.id] = group.options[0].id;
      }
    }

    return nextSingles;
  });
  const [selectedMultiples, setSelectedMultiples] = useState<Record<string, string[]>>(() => {
    const nextMultiples: Record<string, string[]> = {};

    for (const group of product.optionGroups) {
      if (group.selection === "multiple") {
        nextMultiples[group.id] = [];
      }
    }

    return nextMultiples;
  });
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const selectedSingleOptions = product.optionGroups
    .filter((group) => group.selection === "single")
    .map((group) =>
      group.options.find((option) => option.id === selectedSingles[group.id]) ?? null,
    );

  const selectedMultiOptions = product.optionGroups
    .filter((group) => group.selection === "multiple")
    .flatMap((group) =>
      group.options.filter((option) =>
        (selectedMultiples[group.id] ?? []).includes(option.id),
      ),
    );

  const requiredMissing = product.optionGroups.some((group) => {
    if (!group.required) {
      return false;
    }

    if (group.selection === "single") {
      return !selectedSingles[group.id];
    }

    const selectedCount = selectedMultiples[group.id]?.length ?? 0;
    return selectedCount < (group.min ?? 1);
  });

  const extrasTotal =
    selectedSingleOptions.reduce(
      (sum, option) => sum + (option?.priceDelta ?? 0),
      0,
    ) +
    selectedMultiOptions.reduce((sum, option) => sum + option.priceDelta, 0);
  const unitPrice = product.basePrice + extrasTotal;
  const totalPrice = unitPrice * quantity;
  const primaryVariant = selectedSingleOptions[0]?.name ?? null;
  const extraSelections = [
    ...selectedSingleOptions.slice(1).flatMap((option) => (option ? [option.name] : [])),
    ...selectedMultiOptions.map((option) => option.name),
  ];
  const selectionKey = [
    product.id,
    ...selectedSingleOptions.flatMap((option) => (option ? [option.id] : [])),
    ...selectedMultiOptions.map((option) => option.id),
    instructions.trim().toLowerCase(),
  ]
    .filter(Boolean)
    .join("|");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(15,23,42,0.52)] sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-describedby={descriptionId}
        className="max-h-[92vh] w-full overflow-hidden rounded-t-[2rem] bg-[var(--surface)] shadow-[0_28px_60px_rgba(15,23,42,0.28)] sm:max-w-4xl sm:rounded-[2rem]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4 sm:px-6">
          <div>
            <p className="section-label">{brandName}</p>
            <h2 className="section-subtitle mt-2">{product.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--muted-foreground)] transition hover:bg-[var(--surface)]"
            aria-label="Close item details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
            <div className="space-y-4">
              <RemoteImage
                src={product.imageUrl}
                alt={product.name}
                width={920}
                height={720}
                className="h-72 w-full rounded-[1.5rem] object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
              <div>
                <p id={descriptionId} className="text-sm leading-7 text-[var(--muted-foreground)]">
                  {product.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex rounded-full bg-[var(--surface-muted)] px-3 py-1 text-[0.72rem] font-medium text-[var(--foreground)]"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {product.optionGroups.map((group) => (
                <fieldset
                  key={group.id}
                  className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-muted)] p-4"
                >
                  <legend className="px-1 text-sm font-semibold text-[var(--foreground)]">
                    {group.name}
                  </legend>
                  {group.description ? (
                    <p className="mt-2 text-[0.78rem] text-[var(--muted-foreground)]">
                      {group.description}
                    </p>
                  ) : null}
                  <div className="mt-3 space-y-2">
                    {group.options.map((option) => {
                      const isSingle = group.selection === "single";
                      const singleChecked = selectedSingles[group.id] === option.id;
                      const multipleChecked = (selectedMultiples[group.id] ?? []).includes(
                        option.id,
                      );
                      const maxReached =
                        !multipleChecked &&
                        group.selection === "multiple" &&
                        typeof group.max === "number" &&
                        (selectedMultiples[group.id]?.length ?? 0) >= group.max;

                      return (
                        <label
                          key={option.id}
                          className={cn(
                            "flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-transparent bg-white px-4 py-3 text-sm transition hover:border-[var(--border-strong)]",
                            (singleChecked || multipleChecked) &&
                              "border-[var(--brand)] bg-[rgba(184,107,87,0.06)]",
                            maxReached && "cursor-not-allowed opacity-60",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type={isSingle ? "radio" : "checkbox"}
                              name={group.id}
                              checked={isSingle ? singleChecked : multipleChecked}
                              disabled={maxReached}
                              onChange={() => {
                                if (isSingle) {
                                  setSelectedSingles((current) => ({
                                    ...current,
                                    [group.id]: option.id,
                                  }));
                                  return;
                                }

                                setSelectedMultiples((current) => {
                                  const existing = current[group.id] ?? [];
                                  return {
                                    ...current,
                                    [group.id]: existing.includes(option.id)
                                      ? existing.filter((entry) => entry !== option.id)
                                      : [...existing, option.id],
                                  };
                                });
                              }}
                              className="h-4 w-4 accent-[var(--brand)]"
                            />
                            <span className="font-medium text-[var(--foreground)]">
                              {option.name}
                            </span>
                          </div>
                          <span className="text-[0.82rem] text-[var(--muted-foreground)]">
                            {option.priceDelta > 0
                              ? `+${formatCurrency(option.priceDelta)}`
                              : "Included"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}

              <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <label className="field-label">Special instructions</label>
                <Textarea
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                  placeholder="Less sauce, no onions, ring the bell, extra napkins..."
                  className="min-h-24 rounded-xl bg-white"
                />
              </div>

              <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4 shadow-[0_12px_24px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {formatCurrency(unitPrice)} each
                    </p>
                    <p className="mt-1 text-[0.76rem] text-[var(--muted-foreground)]">
                      {categoryName}
                    </p>
                  </div>
                  <div className="inline-flex h-11 items-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted-foreground)] transition hover:bg-white"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-[var(--foreground)]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.min(20, current + 1))}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted-foreground)] transition hover:bg-white"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <Button
                  type="button"
                  className="mt-4 h-11 w-full rounded-xl"
                  disabled={requiredMissing}
                  onClick={() => {
                    onAddToCart({
                      itemId: selectionKey,
                      foodItemId: product.id,
                      kitchenId,
                      slug: product.slug,
                      name: product.name,
                      imageUrl: product.imageUrl,
                      price: unitPrice,
                      quantity,
                      categoryName,
                      itemType: "SINGLE",
                      offerTitle: null,
                      variantLabel: primaryVariant,
                      customizations: extraSelections,
                      instructions: instructions.trim() || null,
                      brandName,
                    });
                    onClose();
                  }}
                >
                  Add to cart · {formatCurrency(totalPrice)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
