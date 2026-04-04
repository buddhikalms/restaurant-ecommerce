import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminKitchenForm } from "@/components/cloud-kitchen/admin-kitchen-form";
import { getAdminKitchenById } from "@/lib/data/cloud-kitchen";

export default async function AdminCloudKitchenEditKitchenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kitchen = await getAdminKitchenById(id);

  if (!kitchen) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cloud Kitchen"
        title={`Edit ${kitchen.name}`}
        description="Update branch location, fulfillment settings, and delivery defaults."
        backHref="/admin/cloud-kitchen/kitchens"
      />
      <AdminKitchenForm
        kitchen={{
          ...kitchen,
          description: kitchen.description ?? undefined,
          phone: kitchen.phone ?? undefined,
          email: kitchen.email ?? undefined,
          addressLine2: kitchen.addressLine2 ?? undefined,
        }}
      />
    </div>
  );
}
