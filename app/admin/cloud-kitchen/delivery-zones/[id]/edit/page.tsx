import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminDeliveryZoneForm } from "@/components/cloud-kitchen/admin-delivery-zone-form";
import { getAdminDeliveryZoneById, getKitchenOptions } from "@/lib/data/cloud-kitchen";

export default async function AdminCloudKitchenEditDeliveryZonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [zone, kitchens] = await Promise.all([
    getAdminDeliveryZoneById(id),
    getKitchenOptions(),
  ]);

  if (!zone) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cloud Kitchen"
        title={`Edit ${zone.name}`}
        description="Update fee overrides, radius rules, or polygon points for this delivery area."
        backHref="/admin/cloud-kitchen/delivery-zones"
      />
      <AdminDeliveryZoneForm
        zone={{
          ...zone,
          description: zone.description ?? undefined,
        }}
        kitchens={kitchens}
      />
    </div>
  );
}
