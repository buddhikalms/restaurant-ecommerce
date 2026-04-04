import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFoodCategoryForm } from "@/components/cloud-kitchen/admin-food-category-form";

export default function AdminCloudKitchenNewCategoryPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cloud Kitchen"
        title="Create food category"
        description="Add a new menu taxonomy entry for the cloud kitchen flow."
        backHref="/admin/cloud-kitchen/categories"
      />
      <AdminFoodCategoryForm />
    </div>
  );
}

