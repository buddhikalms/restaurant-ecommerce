import { Clock3, GitBranch, ShieldCheck, Store } from "lucide-react";

import { BranchSelector } from "@/components/cloud-kitchen/storefront/branch-selector";
import { OrderTypeToggle } from "@/components/cloud-kitchen/storefront/order-type-toggle";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import type {
  StorefrontBranch,
  StorefrontBrand,
  StorefrontOrderType,
  StorefrontScheduleOption,
} from "@/lib/data/cloud-kitchen-storefront";
import { cn, formatCurrency } from "@/lib/utils";

export function KitchenInfoBar({
  orderType,
  onOrderTypeChange,
  branches,
  selectedBranchId,
  onBranchChange,
  brands,
  selectedBrandId,
  onBrandChange,
  scheduleOptions,
  selectedScheduleId,
  onScheduleChange,
  minimumOrder,
  deliveryFee,
  branchesLabel,
}: {
  orderType: StorefrontOrderType;
  onOrderTypeChange: (value: StorefrontOrderType) => void;
  branches: StorefrontBranch[];
  selectedBranchId: string;
  onBranchChange: (value: string) => void;
  brands: StorefrontBrand[];
  selectedBrandId: string;
  onBrandChange: (value: string) => void;
  scheduleOptions: StorefrontScheduleOption[];
  selectedScheduleId: string;
  onScheduleChange: (value: string) => void;
  minimumOrder: number;
  deliveryFee: number;
  branchesLabel: string;
}) {
  const showBrandFilter = brands.length > 1;

  return (
    <section className="rounded-[1.75rem] border border-[var(--border)] bg-white/92 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <OrderTypeToggle value={orderType} onChange={onOrderTypeChange} />
            <BranchSelector
              branches={branches}
              selectedBranchId={selectedBranchId}
              onBranchChange={onBranchChange}
            />
          </div>

          {showBrandFilter ? (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Store className="h-4 w-4 text-[var(--brand-dark)]" />
                <span className="text-[0.78rem] font-medium text-[var(--foreground)]">
                  Browse by brand
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onBrandChange("all")}
                  className={cn(
                    "inline-flex h-10 items-center rounded-full border px-4 text-[0.8rem] font-medium transition",
                    selectedBrandId === "all"
                      ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
                  )}
                >
                  All brands
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => onBrandChange(brand.id)}
                    className={cn(
                      "inline-flex h-10 items-center rounded-full border px-4 text-[0.8rem] font-medium transition",
                      selectedBrandId === brand.id
                        ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
                    )}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="field-label">Scheduled ordering</span>
            <Select
              value={selectedScheduleId}
              onChange={(event) => onScheduleChange(event.target.value)}
              className="h-11 rounded-xl"
            >
              {scheduleOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full bg-[rgba(85,99,71,0.14)] px-3 py-1 text-[0.68rem] tracking-[0.1em] text-[var(--accent-dark)]">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                Halal labels supported
              </Badge>
              <Badge className="rounded-full bg-[rgba(184,107,87,0.14)] px-3 py-1 text-[0.68rem] tracking-[0.1em] text-[var(--brand-dark)]">
                <GitBranch className="mr-1 h-3.5 w-3.5" />
                {branchesLabel}
              </Badge>
            </div>
            <div className="mt-3 grid gap-2 text-[0.8rem] text-[var(--muted-foreground)]">
              <div className="flex items-center justify-between">
                <span>Minimum order</span>
                <span className="font-medium text-[var(--foreground)]">
                  {formatCurrency(minimumOrder)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{orderType === "delivery" ? "Delivery fee" : "Service fee"}</span>
                <span className="font-medium text-[var(--foreground)]">
                  {formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Kitchen schedule</span>
                <span className="inline-flex items-center gap-1 font-medium text-[var(--foreground)]">
                  <Clock3 className="h-3.5 w-3.5" />
                  Live menu
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
