import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteButton } from "@/components/forms/delete-button";
import { getButtonClassName } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { deleteFoodItemAction } from "@/lib/actions/cloud-kitchen-actions";
import { getAdminFoodItems, getFoodCategoryOptions, getKitchenOptions } from "@/lib/data/cloud-kitchen";
import { formatCurrency } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminCloudKitchenFoodsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = toValue(params.q);
  const kitchenId = toValue(params.kitchenId);
  const categoryId = toValue(params.categoryId);
  const [items, kitchens, categories] = await Promise.all([
    getAdminFoodItems({ query, kitchenId, categoryId }),
    getKitchenOptions(),
    getFoodCategoryOptions(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cloud Kitchen"
        title="Food items and availability"
        description="Manage ready-to-eat menu items independently from the wholesale catalog."
        actions={
          <Link href="/admin/cloud-kitchen/foods/new" className={getButtonClassName({})}>
            <span className="text-white">Add food item</span>
          </Link>
        }
      />

      <form className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4" method="get">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
          <Input name="q" defaultValue={query} placeholder="Search food item or description" />
          <Select name="kitchenId" defaultValue={kitchenId}>
            <option value="">All kitchens</option>
            {kitchens.map((kitchen: (typeof kitchens)[number]) => (
              <option key={kitchen.id} value={kitchen.id}>
                {kitchen.name}
              </option>
            ))}
          </Select>
          <Select name="categoryId" defaultValue={categoryId}>
            <option value="">All categories</option>
            {categories.map((category: (typeof categories)[number]) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <button className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-[0.82rem] font-medium text-white">
            Filter
          </button>
        </div>
      </form>

      {items.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item: (typeof items)[number]) => (
            <div key={item.id} className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="admin-kicker">{item.kitchen?.name} • {item.foodCategory?.name}</p>
                  <h2 className="mt-2 text-lg font-semibold text-[var(--admin-foreground)]">{item.name}</h2>
                  <p className="mt-2 text-[0.82rem] leading-6 text-[var(--admin-muted-foreground)]">
                    {item.shortDescription ?? item.description}
                  </p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-[0.72rem] font-semibold ${item.isAvailable ? "bg-[rgba(85,99,71,0.14)] text-[var(--admin-success)]" : "bg-[rgba(179,86,72,0.12)] text-[var(--admin-danger)]"}`}>
                  {item.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>
              <div className="mt-4 grid gap-2 text-[0.78rem] text-[var(--admin-muted-foreground)] sm:grid-cols-2">
                <p>Price: {formatCurrency(item.price)}</p>
                <p>Prep: {item.preparationTimeMins ? `${item.preparationTimeMins} min` : "Default kitchen prep"}</p>
                <p>Featured: {item.isFeatured ? "Yes" : "No"}</p>
                <p>Sort: {item.sortOrder}</p>
              </div>
              <div className="mt-5 flex gap-2">
                <Link href={`/admin/cloud-kitchen/foods/${item.id}/edit`} className={getButtonClassName({ variant: "secondary", size: "sm" })}>
                  Edit
                </Link>
                <DeleteButton
                  itemId={item.id}
                  action={deleteFoodItemAction}
                  label="Delete"
                  confirmMessage="Delete this food item? Existing food orders will block the delete."
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No food items found"
          description="Add your first ready-to-eat item or broaden the current filters."
          actionLabel="Add food item"
          actionHref="/admin/cloud-kitchen/foods/new"
        />
      )}
    </div>
  );
}



