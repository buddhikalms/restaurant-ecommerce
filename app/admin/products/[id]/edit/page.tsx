import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminProductForm } from "@/components/forms/admin-product-form";
import { getAdminCategories, getAdminProductById } from "@/lib/data/admin";

type Params = Promise<{ id: string }>;

export default async function EditAdminProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const [categories, product] = await Promise.all([
    getAdminCategories(),
    getAdminProductById(id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Products"
        title={`Edit ${product.name}`}
        description="Update pricing, imagery, stock, variants, and storefront availability without leaving the admin workspace."
        backHref="/admin/products"
        backLabel="Back to products"
      />
      <AdminProductForm
        product={{
          ...product,
          variantLabel: product.variantLabel ?? undefined,
        }}
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
      />
    </div>
  );
}
