import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCategoryForm } from "@/components/forms/admin-category-form";
import { DeleteButton } from "@/components/forms/delete-button";
import { getButtonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteCategoryAction } from "@/lib/actions/admin-actions";
import { requireAdmin } from "@/lib/auth-helpers";
import { getAdminCategories } from "@/lib/data/admin";

export default async function AdminSettingsPage() {
  const [user, categories] = await Promise.all([requireAdmin(), getAdminCategories()]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Settings"
        title="Admin workspace settings and catalog taxonomy"
        description="Keep the primary admin navigation focused while still giving category management and admin context a clean home."
        actions={
          <Link href="/admin/products/new" className={getButtonClassName({})}>
            Add product
          </Link>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
          <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
            <p className="admin-kicker">Workspace</p>
            <CardTitle className="mt-1 text-sm">Administrator details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div>
              <p className="text-sm font-semibold text-[var(--admin-foreground)]">{user.name}</p>
              <p className="mt-1 text-[0.8rem] text-[var(--admin-muted-foreground)]">
                {user.email}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3 text-[0.8rem] leading-6 text-[var(--admin-muted-foreground)]">
              The new admin shell keeps layout preferences local in the browser, while taxonomy stays editable here for catalog maintenance.
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
          <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
            <p className="admin-kicker">Categories</p>
            <CardTitle className="mt-1 text-sm">Add and maintain product taxonomy</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-4 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4">
              <p className="text-sm font-semibold text-[var(--admin-foreground)]">Create category</p>
              <p className="mt-1 text-[0.78rem] text-[var(--admin-muted-foreground)]">
                Add a new category for use in product forms and storefront browsing.
              </p>
              <div className="mt-4">
                <AdminCategoryForm submitLabel="Create category" />
              </div>
            </div>

            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4"
                >
                  <div className="mb-4 flex flex-col gap-3 border-b border-[var(--admin-border)] pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--admin-foreground)]">
                        {category.name}
                      </p>
                      <p className="mt-1 text-[0.76rem] text-[var(--admin-muted-foreground)]">
                        Slug {category.slug} � {category._count.products} linked products
                      </p>
                    </div>
                    <DeleteButton
                      itemId={category.id}
                      action={deleteCategoryAction}
                      label="Delete"
                      confirmMessage="Delete this category? It must not be linked to products."
                    />
                  </div>
                  <AdminCategoryForm
                    category={{
                      id: category.id,
                      name: category.name,
                      slug: category.slug,
                      description: category.description ?? undefined,
                      isActive: category.isActive,
                    }}
                    submitLabel="Save category"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
