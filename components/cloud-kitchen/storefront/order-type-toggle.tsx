import { Bike, ShoppingBag, UtensilsCrossed } from "lucide-react";

import type { StorefrontOrderType } from "@/lib/data/cloud-kitchen-storefront";
import { cn } from "@/lib/utils";

const orderTypeConfig: Record<
  StorefrontOrderType,
  { label: string; icon: React.ReactNode }
> = {
  delivery: {
    label: "Delivery",
    icon: <Bike className="h-4 w-4" />,
  },
  takeaway: {
    label: "Takeaway",
    icon: <ShoppingBag className="h-4 w-4" />,
  },
  "dine-in": {
    label: "Dine-in",
    icon: <UtensilsCrossed className="h-4 w-4" />,
  },
};

export function OrderTypeToggle({
  value,
  onChange,
}: {
  value: StorefrontOrderType;
  onChange: (value: StorefrontOrderType) => void;
}) {
  return (
    <div>
      <span className="field-label">Order type</span>
      <div className="grid grid-cols-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-1">
        {(
          Object.keys(orderTypeConfig) as StorefrontOrderType[]
        ).map((orderType) => (
          <button
            key={orderType}
            type="button"
            onClick={() => onChange(orderType)}
            className={cn(
              "flex h-11 items-center justify-center gap-2 rounded-xl text-[0.82rem] font-medium transition",
              value === orderType
                ? "bg-[var(--brand)] text-white shadow-[0_10px_18px_rgba(184,107,87,0.24)]"
                : "text-[var(--muted-foreground)] hover:bg-white",
            )}
          >
            {orderTypeConfig[orderType].icon}
            {orderTypeConfig[orderType].label}
          </button>
        ))}
      </div>
    </div>
  );
}
