import { notFound } from "next/navigation";

import { AdminProductForm } from "@/components/forms/admin-product-form";
import { getAdminCategories, getAdminProductById } from "@/lib/data/admin";

type Params = Promise<{ id: string }>;

export default async function EditAdminProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const [categories, product] = await Promise.all([getAdminCategories(), getAdminProductById(id)]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Products</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900">Edit {product.name}</h1>
      </div>
      <AdminProductForm
        product={{
          ...product,
          variantLabel: product.variantLabel ?? undefined
        }}
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
      />
    </div>
  );
}