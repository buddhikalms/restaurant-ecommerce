import { AdminCategoryForm } from "@/components/forms/admin-category-form";
import { DeleteButton } from "@/components/forms/delete-button";
import { deleteCategoryAction } from "@/lib/actions/admin-actions";
import { getAdminCategories } from "@/lib/data/admin";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-8">
      <section className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Categories</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900">Category management</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">Create, update, and retire the taxonomy used in the storefront and admin product forms.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold text-slate-900">Add category</p>
          <div className="mt-4">
            <AdminCategoryForm submitLabel="Create category" />
          </div>
        </div>

        <div className="space-y-5">
          {categories.map((category) => (
            <div key={category.id} className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-heading text-2xl font-semibold text-slate-900">{category.name}</p>
                  <p className="mt-1 text-sm text-slate-500">Slug {category.slug} • {category._count.products} linked products</p>
                </div>
                <DeleteButton itemId={category.id} action={deleteCategoryAction} label="Delete" confirmMessage="Delete this category? It must not be linked to products." />
              </div>
              <AdminCategoryForm
                category={{
                  id: category.id,
                  name: category.name,
                  slug: category.slug,
                  description: category.description ?? undefined,
                  isActive: category.isActive
                }}
                submitLabel="Save category"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}