import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminKitchenForm } from "@/components/cloud-kitchen/admin-kitchen-form";

export default function AdminCloudKitchenNewKitchenPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cloud Kitchen"
        title="Create additional kitchen"
        description="The default cloud kitchen is already created automatically. Only use this page if you need another branch later."
        backHref="/admin/cloud-kitchen/kitchens"
      />
      <AdminKitchenForm />
    </div>
  );
}

