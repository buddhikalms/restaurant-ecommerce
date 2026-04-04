import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminKitchenForm } from "@/components/cloud-kitchen/admin-kitchen-form";

export default function AdminCloudKitchenNewKitchenPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cloud Kitchen"
        title="Create kitchen"
        description="Add a new branch with its location, default delivery fee, and operating state."
        backHref="/admin/cloud-kitchen/kitchens"
      />
      <AdminKitchenForm />
    </div>
  );
}

