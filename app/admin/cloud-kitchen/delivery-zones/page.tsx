import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteButton } from "@/components/forms/delete-button";
import { getButtonClassName } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { deleteDeliveryZoneAction } from "@/lib/actions/cloud-kitchen-actions";
import { getAdminDeliveryZones } from "@/lib/data/cloud-kitchen";

export default async function AdminCloudKitchenDeliveryZonesPage() {
  const zones = await getAdminDeliveryZones();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cloud Kitchen"
        title="Delivery zones"
        description="The default kitchen radius already handles local delivery. Add zones only if you need advanced overrides later."
        actions={
          <Link href="/admin/cloud-kitchen/delivery-zones/new" className={getButtonClassName({})}>
            <span className="text-white">Add zone</span>
          </Link>
        }
      />

      {zones.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {zones.map((zone: (typeof zones)[number]) => (
            <div key={zone.id} className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="admin-kicker">{zone.kitchen?.name}</p>
                  <h2 className="mt-2 text-lg font-semibold text-[var(--admin-foreground)]">{zone.name}</h2>
                  <p className="mt-2 text-[0.82rem] leading-6 text-[var(--admin-muted-foreground)]">
                    {zone.description ?? "No description added yet."}
                  </p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-[0.72rem] font-semibold ${zone.isActive ? "bg-[rgba(85,99,71,0.14)] text-[var(--admin-success)]" : "bg-[rgba(179,86,72,0.12)] text-[var(--admin-danger)]"}`}>
                  {zone.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mt-4 grid gap-2 text-[0.78rem] text-[var(--admin-muted-foreground)] sm:grid-cols-2">
                <p>Type: {zone.zoneType}</p>
                <p>Radius: {zone.radiusKm ?? "-"}</p>
                <p>Delivery fee: {zone.deliveryFee ?? "Kitchen default"}</p>
                <p>Minimum order: {zone.minimumOrderAmount ?? "Kitchen default"}</p>
              </div>
              <div className="mt-5 flex gap-2">
                <Link href={`/admin/cloud-kitchen/delivery-zones/${zone.id}/edit`} className={getButtonClassName({ variant: "secondary", size: "sm" })}>
                  Edit
                </Link>
                <DeleteButton
                  itemId={zone.id}
                  action={deleteDeliveryZoneAction}
                  label="Delete"
                  confirmMessage="Delete this delivery zone? Linked food orders will block the delete."
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No delivery zones found"
          description="You can skip zones entirely unless you need advanced delivery overrides beyond the default kitchen radius."
          actionLabel="Add zone"
          actionHref="/admin/cloud-kitchen/delivery-zones/new"
        />
      )}
    </div>
  );
}

