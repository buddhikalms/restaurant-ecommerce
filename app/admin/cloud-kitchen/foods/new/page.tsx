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
        title="Create food item"
        description="Add a ready-to-eat item to a specific kitchen and menu category."
        backHref="/admin/cloud-kitchen/foods"
      />
      <AdminFoodItemForm kitchens={kitchens} categories={categories} />
    </div>
  );
}

