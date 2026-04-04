import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFoodItemForm } from "@/components/cloud-kitchen/admin-food-item-form";
import { getAdminFoodItemById, getFoodCategoryOptions, getKitchenOptions } from "@/lib/data/cloud-kitchen";

export default async function AdminCloudKitchenEditFoodPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, kitchens, categories] = await Promise.all([
    getAdminFoodItemById(id),
    getKitchenOptions(),
    getFoodCategoryOptions(),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cloud Kitchen"
        title={`Edit ${item.name}`}
        description="Update availability, pricing, kitchen assignment, and category mapping."
        backHref="/admin/cloud-kitchen/foods"
      />
      <AdminFoodItemForm
        item={{
          ...item,
          shortDescription: item.shortDescription ?? undefined,
          compareAtPrice: item.compareAtPrice ?? undefined,
          preparationTimeMins: item.preparationTimeMins ?? undefined,
        }}
        kitchens={kitchens}
        categories={categories}
      />
    </div>
  );
}
