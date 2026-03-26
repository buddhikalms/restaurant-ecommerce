import { AdminProductForm } from "@/components/forms/admin-product-form";
import { getAdminCategories } from "@/lib/data/admin";

export default async function NewAdminProductPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Products</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900">Create a new product</h1>
      </div>
      <AdminProductForm categories={categories.map((category) => ({ id: category.id, name: category.name }))} />
    </div>
  );
}
