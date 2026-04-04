import Link from "next/link";

import { formatDistanceKm } from "@/lib/utils";

type FoodLocationSummaryProps = {
  selection: {
    kitchenName: string;
    deliveryZoneName: string | null;
    distanceKm: number | null;
    address: {
      formattedAddress: string;
      label: string | null;
    };
  } | null;
};

export function FoodLocationSummary({ selection }: FoodLocationSummaryProps) {
  if (!selection) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-[0.82rem] text-[var(--muted-foreground)]">
        Delivery location not selected yet. <Link href="/food/location" className="warm-link">Choose your address</Link> to unlock the menu.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="section-label">Delivery unlocked</p>
          <h2 className="mt-2 text-lg font-semibold text-[var(--foreground)]">{selection.kitchenName}</h2>
          <p className="mt-1 text-[0.82rem] text-[var(--muted-foreground)]">{selection.address.label ?? "Selected address"}: {selection.address.formattedAddress}</p>
          <p className="mt-1 text-[0.76rem] text-[var(--muted-foreground)]">
            {selection.deliveryZoneName ? `Zone: ${selection.deliveryZoneName}` : "Radius delivery enabled"}
            {selection.distanceKm !== null ? ` • ${formatDistanceKm(selection.distanceKm)}` : ""}
          </p>
        </div>
        <Link
          href="/food/location"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-[0.8rem] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
        >
          Change location
        </Link>
      </div>
    </div>
  );
}



