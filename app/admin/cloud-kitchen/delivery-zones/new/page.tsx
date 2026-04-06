import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminDeliveryZoneForm } from "@/components/cloud-kitchen/admin-delivery-zone-form";
import { getKitchenOptions } from "@/lib/data/cloud-kitchen";

export default async function AdminCloudKitchenNewDeliveryZonePage() {
  const kitchens = await getKitchenOptions();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cloud Kitchen"
        title="Create delivery zone"
        description="Optional advanced override for the default kitchen radius and fee settings."
        backHref="/admin/cloud-kitchen/delivery-zones"
      />
      <AdminDeliveryZoneForm kitchens={kitchens} />
    </div>
  );
}

