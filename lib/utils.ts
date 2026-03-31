import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

import { type PricingMode } from "@/lib/user-roles";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(value));
}

export function formatDate(value: Date | string) {
  return format(new Date(value), "MMM d, yyyy");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber(pricingMode: PricingMode) {
  const timestamp = new Date();
  const parts = [
    timestamp.getFullYear(),
    String(timestamp.getMonth() + 1).padStart(2, "0"),
    String(timestamp.getDate()).padStart(2, "0"),
    Math.random().toString().slice(2, 6),
  ];

  const prefix = pricingMode === "wholesale" ? "WS" : "RT";

  return `${prefix}-${parts.join("")}`;
}

export function getStockLabel(stockQuantity: number) {
  if (stockQuantity <= 0) return "Out of stock";
  if (stockQuantity <= 10) return "Low stock";
  return "In stock";
}

export function getOrderStatusTone(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "bg-[rgba(184,107,87,0.12)] text-[var(--brand-dark)]";
    case "PROCESSING":
      return "bg-[rgba(239,228,200,0.7)] text-[var(--foreground)]";
    case "SHIPPED":
      return "bg-[rgba(85,99,71,0.1)] text-[var(--accent-dark)]";
    case "COMPLETED":
      return "bg-[rgba(85,99,71,0.14)] text-[var(--accent-dark)]";
    case "CANCELLED":
      return "bg-[rgba(179,86,72,0.12)] text-[var(--danger)]";
    default:
      return "bg-[var(--surface-muted)] text-[var(--foreground)]";
  }
}
