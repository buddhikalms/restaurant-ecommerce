type NumericLike = number | { toString(): string };

export type VariantSummaryInput = {
  normalPrice: NumericLike;
  wholesalePrice: NumericLike;
  stockQuantity: number;
  minOrderQuantity: number;
  isActive?: boolean;
};

function toNumber(value: NumericLike) {
  return typeof value === "number" ? value : Number(value.toString());
}

export function summarizeActiveProductVariants(variants: VariantSummaryInput[]) {
  const activeVariants = variants.filter((variant) => variant.isActive !== false);

  if (!activeVariants.length) {
    throw new Error("Variable products must have at least one active option.");
  }

  const sellableVariants = activeVariants.filter((variant) => variant.stockQuantity > 0);
  const pricingSource = sellableVariants.length ? sellableVariants : activeVariants;

  return {
    normalPrice: Math.min(...pricingSource.map((variant) => toNumber(variant.normalPrice))),
    wholesalePrice: Math.min(...pricingSource.map((variant) => toNumber(variant.wholesalePrice))),
    stockQuantity: activeVariants.reduce((sum, variant) => sum + variant.stockQuantity, 0),
    minOrderQuantity: Math.min(...pricingSource.map((variant) => variant.minOrderQuantity))
  };
}