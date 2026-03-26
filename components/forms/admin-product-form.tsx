"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { upsertProductAction } from "@/lib/actions/admin-actions";
import { productSchema } from "@/lib/validations/admin";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ProductFormInput = z.input<typeof productSchema>;
type ProductFormValues = z.output<typeof productSchema>;
type ProductFormProduct = Omit<Partial<ProductFormInput>, "information" | "ingredients" | "nutritional" | "faq"> & {
  galleryImageUrls?: string[];
  information?: string | null;
  ingredients?: string | null;
  nutritional?: string | null;
  faq?: string | null;
};

function buildVariantSeed(product?: ProductFormProduct) {
  return {
    name: "",
    sku: "",
    normalPrice: product?.normalPrice ?? 0,
    wholesalePrice: product?.wholesalePrice ?? 0,
    stockQuantity: product?.stockQuantity ?? 0,
    minOrderQuantity: product?.minOrderQuantity ?? 1,
    isActive: true
  };
}

export function AdminProductForm({
  product,
  categories
}: {
  product?: ProductFormProduct;
  categories: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      id: product?.id,
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      sku: product?.sku ?? "",
      description: product?.description ?? "",
      information: product?.information ?? "",
      ingredients: product?.ingredients ?? "",
      nutritional: product?.nutritional ?? "",
      faq: product?.faq ?? "",
      imageUrl: product?.imageUrl ?? "",
      galleryImageUrlsText: product?.galleryImageUrls?.join("\n") ?? "",
      productType: product?.productType ?? "SIMPLE",
      variantLabel: product?.variantLabel ?? "Pack size",
      normalPrice: product?.normalPrice ?? 0,
      wholesalePrice: product?.wholesalePrice ?? 0,
      stockQuantity: product?.stockQuantity ?? 0,
      minOrderQuantity: product?.minOrderQuantity ?? 1,
      categoryId: product?.categoryId ?? categories[0]?.id,
      isActive: product?.isActive ?? true,
      variants: product?.variants?.map((variant) => ({
        id: variant.id,
        name: variant.name,
        sku: variant.sku,
        normalPrice: variant.normalPrice,
        wholesalePrice: variant.wholesalePrice,
        stockQuantity: variant.stockQuantity,
        minOrderQuantity: variant.minOrderQuantity,
        isActive: variant.isActive
      })) ?? []
    }
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants"
  });
  const isActive = useWatch({ control, name: "isActive" }) ?? true;
  const productType = useWatch({ control, name: "productType" }) ?? "SIMPLE";
  const variantsError = typeof errors.variants?.message === "string" ? errors.variants.message : undefined;

  useEffect(() => {
    if (productType === "VARIABLE" && fields.length === 0) {
      append(buildVariantSeed(product));
    }
  }, [append, fields.length, product, productType]);

  return (
    <form
      className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
      onSubmit={handleSubmit((values) => {
        setMessage(null);
        startTransition(async () => {
          const result = await upsertProductAction(values);
          if (!result.success) {
            setMessage(result.error);
            return;
          }

          router.push("/admin/products");
          router.refresh();
        });
      })}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <input type="hidden" {...register("id")} />
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Product name</label>
          <Input {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Slug</label>
          <Input {...register("slug")} placeholder="Auto-generated if empty" />
          <FieldError message={errors.slug?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Parent SKU</label>
          <Input {...register("sku")} />
          <FieldError message={errors.sku?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
          <Select {...register("categoryId")}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <FieldError message={errors.categoryId?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Product type</label>
          <Select {...register("productType")}>
            <option value="SIMPLE">Simple product</option>
            <option value="VARIABLE">Variable product</option>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Image URL</label>
          <Input {...register("imageUrl")} />
          <FieldError message={errors.imageUrl?.message} />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Gallery image URLs</label>
          <Textarea
            rows={5}
            {...register("galleryImageUrlsText")}
            placeholder={"One image URL per line\nhttps://images.unsplash.com/...\nhttps://images.unsplash.com/..."}
          />
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Optional. Add up to 8 extra gallery images. The main image above stays the product cover image.
          </p>
          <FieldError message={errors.galleryImageUrlsText?.message} />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
          <Textarea {...register("description")} />
          <FieldError message={errors.description?.message} />
        </div>
      </div>

      <div className="mt-6 rounded-[2rem] border border-slate-200 bg-[rgba(255,251,244,0.88)] p-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">Product detail tabs</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            These fields appear as the fixed tabs below the product page: Information, Ingredients, Nutritional, and FAQ.
          </p>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Information</label>
            <Textarea rows={6} {...register("information")} placeholder="Product overview, usage notes, storage guidance..." />
            <FieldError message={errors.information?.message} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Ingredients</label>
            <Textarea rows={6} {...register("ingredients")} placeholder="Ingredient list, allergens, origin notes..." />
            <FieldError message={errors.ingredients?.message} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Nutritional</label>
            <Textarea rows={6} {...register("nutritional")} placeholder="Nutrition facts, serving size, per-100g values..." />
            <FieldError message={errors.nutritional?.message} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">FAQ</label>
            <Textarea rows={6} {...register("faq")} placeholder="Common questions and answers for this product..." />
            <FieldError message={errors.faq?.message} />
          </div>
        </div>
      </div>

      {productType === "SIMPLE" ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Normal price</label>
            <Input type="number" step="0.01" min="0" {...register("normalPrice", { valueAsNumber: true })} />
            <FieldError message={errors.normalPrice?.message} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Wholesale price</label>
            <Input type="number" step="0.01" min="0" {...register("wholesalePrice", { valueAsNumber: true })} />
            <FieldError message={errors.wholesalePrice?.message} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Stock quantity</label>
            <Input type="number" min="0" {...register("stockQuantity", { valueAsNumber: true })} />
            <FieldError message={errors.stockQuantity?.message} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Wholesale minimum quantity</label>
            <Input type="number" min="1" {...register("minOrderQuantity", { valueAsNumber: true })} />
            <FieldError message={errors.minOrderQuantity?.message} />
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-[2rem] border border-slate-200 bg-[rgba(255,251,244,0.88)] p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">Variable product</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Add the purchasable options for this product. Catalog cards and filters will use the lowest active option price and combined active stock.
              </p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={() => append(buildVariantSeed(product))}>
              Add option
            </Button>
          </div>

          <div className="mt-5 max-w-sm">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Option label</label>
            <Input {...register("variantLabel")} placeholder="Pack size, weight, flavor..." />
            <FieldError message={errors.variantLabel?.message} />
          </div>

          {variantsError ? <FieldError message={variantsError} /> : null}

          <div className="mt-5 space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <input type="hidden" {...register(`variants.${index}.id`)} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Option {index + 1}</p>
                    <p className="text-sm text-slate-500">Customers will choose this option on the product page.</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} disabled={fields.length === 1}>
                    Remove option
                  </Button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Option name</label>
                    <Input {...register(`variants.${index}.name`)} placeholder="25kg sack" />
                    <FieldError message={errors.variants?.[index]?.name?.message} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Option SKU</label>
                    <Input {...register(`variants.${index}.sku`)} placeholder="RICE-001-25" />
                    <FieldError message={errors.variants?.[index]?.sku?.message} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Normal price</label>
                    <Input type="number" step="0.01" min="0" {...register(`variants.${index}.normalPrice`, { valueAsNumber: true })} />
                    <FieldError message={errors.variants?.[index]?.normalPrice?.message} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Wholesale price</label>
                    <Input type="number" step="0.01" min="0" {...register(`variants.${index}.wholesalePrice`, { valueAsNumber: true })} />
                    <FieldError message={errors.variants?.[index]?.wholesalePrice?.message} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Stock quantity</label>
                    <Input type="number" min="0" {...register(`variants.${index}.stockQuantity`, { valueAsNumber: true })} />
                    <FieldError message={errors.variants?.[index]?.stockQuantity?.message} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Wholesale minimum quantity</label>
                    <Input type="number" min="1" {...register(`variants.${index}.minOrderQuantity`, { valueAsNumber: true })} />
                    <FieldError message={errors.variants?.[index]?.minOrderQuantity?.message} />
                  </div>
                </div>

                <label className="mt-4 flex items-center gap-3 text-sm font-medium text-slate-700">
                  <input type="checkbox" {...register(`variants.${index}.isActive`)} className="h-4 w-4 rounded border-slate-300" />
                  Option is active in the storefront
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <label className="mt-5 flex items-center gap-3 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => setValue("isActive", event.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        Product is active in the storefront
      </label>

      {message ? <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : product?.id ? "Save changes" : "Create product"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}