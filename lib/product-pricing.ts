export const VAT_MODE_VALUES = ["INCLUDED", "EXCLUDED"] as const;

export type VatModeValue = (typeof VAT_MODE_VALUES)[number];

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function normalizeVatRate(value: unknown) {
  const rate = Number(value);

  if (!Number.isFinite(rate) || rate < 0) {
    return 0;
  }

  return roundCurrency(rate);
}

export function formatVatRate(value: unknown) {
  const normalizedRate = normalizeVatRate(value);

  return Number.isInteger(normalizedRate)
    ? `${normalizedRate}`
    : normalizedRate.toFixed(2).replace(/\.?0+$/, "");
}

export function calculatePriceWithVat(
  price: unknown,
  vatRate: unknown,
  vatMode: VatModeValue,
) {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  const normalizedAmount = roundCurrency(amount);
  const normalizedRate = normalizeVatRate(vatRate);

  if (normalizedRate <= 0 || vatMode === "INCLUDED") {
    return normalizedAmount;
  }

  return roundCurrency(normalizedAmount * (1 + normalizedRate / 100));
}

export function calculatePriceWithoutVat(
  price: unknown,
  vatRate: unknown,
  vatMode: VatModeValue,
) {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  const normalizedAmount = roundCurrency(amount);
  const normalizedRate = normalizeVatRate(vatRate);

  if (normalizedRate <= 0 || vatMode === "EXCLUDED") {
    return normalizedAmount;
  }

  return roundCurrency(normalizedAmount / (1 + normalizedRate / 100));
}

export function calculateVatAmount(
  price: unknown,
  vatRate: unknown,
  vatMode: VatModeValue,
) {
  return roundCurrency(
    calculatePriceWithVat(price, vatRate, vatMode) -
      calculatePriceWithoutVat(price, vatRate, vatMode),
  );
}

export function getEnteredPriceVatDescription(
  vatMode: VatModeValue,
  vatRate: unknown,
) {
  const normalizedRate = normalizeVatRate(vatRate);

  if (normalizedRate <= 0) {
    return "No VAT will be applied to this product.";
  }

  return vatMode === "INCLUDED"
    ? `Entered prices already include ${formatVatRate(normalizedRate)}% VAT.`
    : `${formatVatRate(normalizedRate)}% VAT will be added on top of entered prices when totals are shown.`;
}

export function getDisplayedPriceVatLabel(vatRate: unknown) {
  const normalizedRate = normalizeVatRate(vatRate);

  if (normalizedRate <= 0) {
    return "No VAT";
  }

  return `Incl. VAT (${formatVatRate(normalizedRate)}%)`;
}

export function getAdminVatSummary(
  vatMode: VatModeValue,
  vatRate: unknown,
) {
  const normalizedRate = normalizeVatRate(vatRate);

  if (normalizedRate <= 0) {
    return "No VAT";
  }

  return vatMode === "INCLUDED"
    ? `VAT included ${formatVatRate(normalizedRate)}%`
    : `VAT added ${formatVatRate(normalizedRate)}%`;
}
