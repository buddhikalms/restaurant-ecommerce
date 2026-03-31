import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminProductForm } from "@/components/forms/admin-product-form";
import { getButtonClassName } from "@/components/ui/button";
import { getAdminCategories } from "@/lib/data/admin";

export default async function NewAdminProductPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Products"
        title="Create a new catalog item"
        description="Add product details, pricing, VAT, imagery, and variants using the compact admin form."
        backHref="/admin/products"
        backLabel="Back to products"
        actions={
          <Link
            href="/admin/settings"
            className={getButtonClassName({ variant: "secondary" })}
          >
            Manage categories
          </Link>
        }
      />
      <AdminProductForm
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
      />
    </div>
  );
}
