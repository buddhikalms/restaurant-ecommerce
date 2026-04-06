import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFoodItemForm } from "@/components/cloud-kitchen/admin-food-item-form";
import { getFoodCategoryOptions, getKitchenOptions } from "@/lib/data/cloud-kitchen";

export default async function AdminCloudKitchenNewFoodPage() {
  const [kitchens, categories] = await Promise.all([
    getKitchenOptions(),
    getFoodCategoryOptions(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cloud Kitchen"
        title="Create meal item"
        description="A default kitchen and meals category are created automatically, so you can just add dishes here."
        backHref="/admin/cloud-kitchen/foods"
      />
      <AdminFoodItemForm kitchens={kitchens} categories={categories} />
    </div>
  );
}

