import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFoodCategoryForm } from "@/components/cloud-kitchen/admin-food-category-form";
import { getAdminFoodCategoryById } from "@/lib/data/cloud-kitchen";

export default async function AdminCloudKitchenEditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getAdminFoodCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cloud Kitchen"
        title={`Edit ${category.name}`}
        description="Update food category naming, description, and menu ordering."
        backHref="/admin/cloud-kitchen/categories"
      />
      <AdminFoodCategoryForm
        category={{
          ...category,
          description: category.description ?? undefined,
        }}
      />
    </div>
  );
}
