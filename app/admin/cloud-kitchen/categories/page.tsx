import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteButton } from "@/components/forms/delete-button";
import { getButtonClassName } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { deleteFoodCategoryAction } from "@/lib/actions/cloud-kitchen-actions";
import { getAdminFoodCategories } from "@/lib/data/cloud-kitchen";

export default async function AdminCloudKitchenCategoriesPage() {
  const categories = await getAdminFoodCategories();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cloud Kitchen"
        title="Food categories"
        description="Organize menu sections independently from wholesale product categories."
        actions={
          <Link href="/admin/cloud-kitchen/categories/new" className={getButtonClassName({})}>
            <span className="text-white">Add category</span>
          </Link>
        }
      />

      {categories.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {categories.map((category: (typeof categories)[number]) => (
            <div key={category.id} className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="admin-kicker">Sort {category.sortOrder}</p>
                  <h2 className="mt-2 text-lg font-semibold text-[var(--admin-foreground)]">{category.name}</h2>
                  <p className="mt-2 text-[0.82rem] leading-6 text-[var(--admin-muted-foreground)]">
                    {category.description ?? "No description added yet."}
                  </p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-[0.72rem] font-semibold ${category.isActive ? "bg-[rgba(85,99,71,0.14)] text-[var(--admin-success)]" : "bg-[rgba(179,86,72,0.12)] text-[var(--admin-danger)]"}`}>
                  {category.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-4 text-[0.78rem] text-[var(--admin-muted-foreground)]">
                {category._count.foodItems} food items linked
              </p>
              <div className="mt-5 flex gap-2">
                <Link href={`/admin/cloud-kitchen/categories/${category.id}/edit`} className={getButtonClassName({ variant: "secondary", size: "sm" })}>
                  Edit
                </Link>
                <DeleteButton
                  itemId={category.id}
                  action={deleteFoodCategoryAction}
                  label="Delete"
                  confirmMessage="Delete this food category? Linked menu items will block the delete."
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No food categories found"
          description="Add categories like Rice Bowls, Curries, or Drinks for the cloud kitchen menu."
          actionLabel="Add category"
          actionHref="/admin/cloud-kitchen/categories/new"
        />
      )}
    </div>
  );
}


