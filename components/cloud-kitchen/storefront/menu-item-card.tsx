import { Clock3, Flame, Leaf, Plus, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RemoteImage } from "@/components/ui/remote-image";
import type { StorefrontProduct } from "@/lib/data/cloud-kitchen-storefront";
import { cn, formatCurrency } from "@/lib/utils";

export function MenuItemCard({
  product,
  brandName,
  onSelect,
}: {
  product: StorefrontProduct;
  brandName: string;
  onSelect: () => void;
}) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_14px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]",
        !product.isAvailable && "opacity-70",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        disabled={!product.isAvailable}
        className="flex w-full flex-col text-left disabled:cursor-not-allowed"
      >
        <div className="relative">
          <RemoteImage
            src={product.imageUrl}
            alt={product.name}
            width={640}
            height={420}
            className="h-48 w-full object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {product.badges.map((badge) => (
              <Badge
                key={badge}
                className="rounded-full bg-white/92 px-3 py-1 text-[0.68rem] tracking-[0.1em] text-[var(--foreground)]"
              >
                {badge}
              </Badge>
            ))}
          </div>
          {!product.isAvailable ? (
            <div className="absolute inset-x-0 bottom-0 bg-[rgba(15,23,42,0.72)] px-4 py-2 text-[0.74rem] font-medium text-white">
              Sold out for now
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[var(--brand-dark)]">
                {brandName}
              </p>
              <h3 className="mt-2 text-base font-semibold text-[var(--foreground)]">
                {product.name}
              </h3>
            </div>
            <div className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-sm font-semibold text-[var(--foreground)]">
              {formatCurrency(product.basePrice)}
            </div>
          </div>

          <p className="mt-3 line-clamp-2 text-[0.84rem] leading-6 text-[var(--muted-foreground)]">
            {product.shortDescription}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {product.labels.map((label) => (
              <LabelPill key={label} label={label} />
            ))}
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-3 py-1 text-[0.72rem] font-medium text-[var(--muted-foreground)]">
              <Clock3 className="h-3.5 w-3.5" />
              {product.prepTime}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[0.76rem] text-[var(--muted-foreground)]">
              {product.optionGroups.length
                ? "Variants and add-ons available"
                : "Quick add item"}
            </p>
            <Button
              type="button"
              size="sm"
              className="rounded-full px-4"
              disabled={!product.isAvailable}
            >
              <Plus className="h-4 w-4" />
              {product.optionGroups.length ? "Customize" : "Add"}
            </Button>
          </div>
        </div>
      </button>
    </article>
  );
}

function LabelPill({ label }: { label: string }) {
  const icon =
    label === "Veg" ? (
      <Leaf className="h-3.5 w-3.5" />
    ) : label === "Spicy" ? (
      <Flame className="h-3.5 w-3.5" />
    ) : (
      <ShieldCheck className="h-3.5 w-3.5" />
    );

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-3 py-1 text-[0.72rem] font-medium text-[var(--foreground)]">
      {icon}
      {label}
    </span>
  );
}
