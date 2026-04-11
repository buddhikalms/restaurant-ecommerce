import { Bike, Clock3, MapPin, Search, Star, Wallet } from "lucide-react";

import { FoodCartIndicator } from "@/components/cloud-kitchen/food-cart-indicator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RemoteImage } from "@/components/ui/remote-image";
import type {
  CloudKitchenStorefrontData,
  StorefrontBranch,
} from "@/lib/data/cloud-kitchen-storefront";
import { formatCurrency } from "@/lib/utils";

export function CloudKitchenHeader({
  kitchen,
  branch,
  searchValue,
  onSearchChange,
}: {
  kitchen: CloudKitchenStorefrontData["kitchen"];
  branch: StorefrontBranch;
  searchValue: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <div className="relative h-56 sm:h-72">
        <RemoteImage
          src={kitchen.coverImageUrl}
          alt={kitchen.name}
          width={1440}
          height={640}
          priority
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.15),rgba(15,23,42,0.72))]" />
        <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2">
          <Badge className="rounded-full bg-white/95 px-3 py-1 text-[0.68rem] tracking-[0.14em] text-[var(--foreground)]">
            Cloud Kitchen
          </Badge>
          <Badge
            className={
              kitchen.isOpen
                ? "rounded-full bg-[rgba(34,197,94,0.16)] px-3 py-1 text-[0.68rem] tracking-[0.14em] text-[var(--success)]"
                : "rounded-full bg-[rgba(179,86,72,0.14)] px-3 py-1 text-[0.68rem] tracking-[0.14em] text-[var(--danger)]"
            }
          >
            {kitchen.isOpen ? "Open now" : "Closed"}
          </Badge>
        </div>
      </div>

      <div className="relative px-4 pb-5 pt-0 sm:px-6 sm:pb-6">
        <div className="-mt-12 rounded-[1.75rem] border border-white/70 bg-white/95 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur sm:-mt-14 sm:p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-muted)]">
                <RemoteImage
                  src={kitchen.logoImageUrl}
                  alt={`${kitchen.name} logo`}
                  width={160}
                  height={160}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="section-label">Fast ordering storefront</p>
                  <h1 className="section-title mt-2">{kitchen.name}</h1>
                  <p className="section-copy mt-2 max-w-3xl">{kitchen.tagline}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {kitchen.cuisines.map((cuisine) => (
                    <Badge
                      key={cuisine}
                      className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-[0.68rem] tracking-[0.08em] text-[var(--muted-foreground)]"
                    >
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3 lg:min-w-[20rem]">
              <div className="flex justify-start lg:justify-end">
                <FoodCartIndicator
                  showSubtotal
                  className="h-11 rounded-2xl px-4 text-[0.82rem] shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
                />
              </div>
              <div className="grid gap-3 text-[0.8rem] text-[var(--muted-foreground)] sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                  <div className="flex items-center gap-2 font-medium text-[var(--foreground)]">
                    <Star className="h-4 w-4 text-amber-500" />
                    {kitchen.rating.toFixed(1)} rating
                  </div>
                  <p className="mt-1">{kitchen.reviewCount.toLocaleString()} verified orders</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                  <div className="flex items-center gap-2 font-medium text-[var(--foreground)]">
                    <Clock3 className="h-4 w-4 text-[var(--brand-dark)]" />
                    {branch.eta}
                  </div>
                  <p className="mt-1">{kitchen.nextStatusNote}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <InfoTile
                icon={<Wallet className="h-4 w-4" />}
                label="Minimum order"
                value={formatCurrency(branch.minimumOrder)}
              />
              <InfoTile
                icon={<Bike className="h-4 w-4" />}
                label="Delivery fee"
                value={formatCurrency(branch.deliveryFee)}
              />
              <InfoTile
                icon={<Clock3 className="h-4 w-4" />}
                label="Branch ETA"
                value={branch.eta}
              />
              <InfoTile
                icon={<MapPin className="h-4 w-4" />}
                label="Address"
                value={branch.address}
              />
            </div>

            <label className="block">
              <span className="field-label">Search the menu</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <Input
                  value={searchValue}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Search burgers, pizza, drinks, desserts..."
                  className="h-11 rounded-xl pl-10"
                />
              </div>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <div className="flex items-center gap-2 text-[var(--foreground)]">
        {icon}
        <span className="text-[0.74rem] font-medium uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
          {label}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}
