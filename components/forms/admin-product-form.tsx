"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { type Path, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { upsertProductAction } from "@/lib/actions/admin-actions";
import { getEnteredPriceVatDescription } from "@/lib/product-pricing";
import { productSchema } from "@/lib/validations/admin";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ProductFormInput = z.input<typeof productSchema>;
type ProductFormValues = z.output<typeof productSchema>;
type ProductFormProduct = Omit<
  Partial<ProductFormInput>,
  "information" | "ingredients" | "nutritional" | "faq" | "retainedGalleryImageUrls"
> & {
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
    isActive: true,
  };
}

export function AdminProductForm({
  product,
  categories,
}: {
  product?: ProductFormProduct;
  categories: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [retainedGalleryImageUrls, setRetainedGalleryImageUrls] = useState(
    product?.galleryImageUrls ?? [],
  );
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([]);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
  const primaryImageInputRef = useRef<HTMLInputElement | null>(null);
  const galleryImageInputRef = useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
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
      retainedGalleryImageUrls: product?.galleryImageUrls ?? [],
      productType: product?.productType ?? "SIMPLE",
      variantLabel: product?.variantLabel ?? "Pack size",
      vatMode: product?.vatMode ?? "INCLUDED",
      vatRate: product?.vatRate ?? 20,
      normalPrice: product?.normalPrice ?? 0,
      wholesalePrice: product?.wholesalePrice ?? 0,
      stockQuantity: product?.stockQuantity ?? 0,
      minOrderQuantity: product?.minOrderQuantity ?? 1,
      categoryId: product?.categoryId ?? categories[0]?.id,
      isActive: product?.isActive ?? true,
      variants:
        product?.variants?.map((variant) => ({
          id: variant.id,
          name: variant.name,
          sku: variant.sku,
          normalPrice: variant.normalPrice,
          wholesalePrice: variant.wholesalePrice,
          stockQuantity: variant.stockQuantity,
          minOrderQuantity: variant.minOrderQuantity,
          isActive: variant.isActive,
        })) ?? [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });
  const isActive = useWatch({ control, name: "isActive" }) ?? true;
  const productType = useWatch({ control, name: "productType" }) ?? "SIMPLE";
  const vatMode = useWatch({ control, name: "vatMode" }) ?? "INCLUDED";
  const vatRate = useWatch({ control, name: "vatRate" }) ?? 20;
  const variantsError =
    typeof errors.variants?.message === "string"
      ? errors.variants.message
      : undefined;
  const priceLabel = vatMode === "INCLUDED" ? "Price with VAT" : "Price without VAT";
  const wholesalePriceLabel =
    vatMode === "INCLUDED"
      ? "Wholesale price with VAT"
      : "Wholesale price without VAT";
  const vatHelperText = getEnteredPriceVatDescription(vatMode, vatRate);
  const coverImageUrl = coverPreviewUrl ?? product?.imageUrl ?? "";

  useEffect(() => {
    if (productType === "VARIABLE" && fields.length === 0) {
      append(buildVariantSeed(product));
    }
  }, [append, fields.length, product, productType]);

  useEffect(() => {
    setValue("retainedGalleryImageUrls", retainedGalleryImageUrls, {
      shouldValidate: true,
    });
  }, [retainedGalleryImageUrls, setValue]);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  useEffect(() => {
    return () => {
      galleryPreviewUrls.forEach((previewUrl) => {
        if (previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl);
        }
      });
    };
  }, [galleryPreviewUrls]);

  const resetPrimaryImageSelection = () => {
    if (primaryImageInputRef.current) {
      primaryImageInputRef.current.value = "";
    }

    setCoverPreviewUrl(null);
    clearErrors("imageUrl");
  };

  const resetGalleryImageSelection = () => {
    if (galleryImageInputRef.current) {
      galleryImageInputRef.current.value = "";
    }

    setSelectedGalleryFiles([]);
    setGalleryPreviewUrls([]);
    clearErrors("retainedGalleryImageUrls");
  };

  return (
    <form
      encType="multipart/form-data"
      className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
      onSubmit={handleSubmit((values, event) => {
        clearErrors();
        setMessage(null);

        const existingImageUrl = values.imageUrl?.trim() ?? "";
        const formElement = event?.currentTarget;
        if (!(formElement instanceof HTMLFormElement)) {
          setMessage("Unable to submit the product form right now.");
          return;
        }

        const formData = new FormData(formElement);
        const coverEntry = formData.get("primaryImageFile");
        const coverFile =
          coverEntry instanceof File && coverEntry.size > 0 ? coverEntry : null;
        const selectedGalleryFileCount = formData
          .getAll("galleryImageFiles")
          .filter((entry) => entry instanceof File && entry.size > 0).length;

        if (!existingImageUrl && !coverFile) {
          setError("imageUrl", {
            type: "manual",
            message: "Upload a product cover image before saving.",
          });
          return;
        }

        if (retainedGalleryImageUrls.length + selectedGalleryFileCount > 8) {
          setError("retainedGalleryImageUrls", {
            type: "manual",
            message: "You can keep up to 8 gallery images.",
          });
          return;
        }
        const payload: ProductFormValues = {
          ...values,
          imageUrl: existingImageUrl,
          retainedGalleryImageUrls,
        };

        formData.set("payload", JSON.stringify(payload));

        startTransition(async () => {
          const result = await upsertProductAction(formData);
          if (!result.success) {
            if (result.fieldErrors) {
              Object.entries(result.fieldErrors).forEach(([field, messages]) => {
                const message = messages?.[0];
                if (!message) {
                  return;
                }

                setError(field as Path<ProductFormInput>, {
                  type: "server",
                  message,
                });
              });
            }

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
        <input type="hidden" {...register("imageUrl")} />
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Product name
          </label>
          <Input {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Slug
          </label>
          <Input {...register("slug")} placeholder="Auto-generated if empty" />
          <FieldError message={errors.slug?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Parent SKU
          </label>
          <Input {...register("sku")} />
          <FieldError message={errors.sku?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Category
          </label>
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
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Product type
          </label>
          <Select {...register("productType")}>
            <option value="SIMPLE">Simple product</option>
            <option value="VARIABLE">Variable product</option>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            VAT mode
          </label>
          <Select {...register("vatMode")}>
            <option value="INCLUDED">Entered prices include VAT</option>
            <option value="EXCLUDED">Entered prices exclude VAT</option>
          </Select>
          <FieldError message={errors.vatMode?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            VAT rate (%)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...register("vatRate", { valueAsNumber: true })}
          />
          <FieldError message={errors.vatRate?.message} />
        </div>
        <div className="md:col-span-2 rounded-[1.6rem] border border-slate-200 bg-[rgba(255,251,244,0.88)] p-4 text-sm leading-6 text-slate-600">
          {vatHelperText} Storefront prices, cart totals, checkout totals, and orders will show VAT-inclusive totals.
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Cover image upload
          </label>
          <input
            ref={primaryImageInputRef}
            name="primaryImageFile"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
            onChange={(event) => {
              clearErrors("imageUrl");
              setMessage(null);

              const file = event.target.files?.[0];
              if (!file) {
                setCoverPreviewUrl(null);
                return;
              }

              setCoverPreviewUrl(URL.createObjectURL(file));
            }}
            className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 file:mr-4 file:rounded-full file:border-0 file:bg-[var(--brand-dark)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Upload JPG, PNG, WebP, AVIF, or GIF. Max size 5MB. If you do not upload a new cover image while editing, the current cover image will stay in place.
          </p>
          <FieldError message={errors.imageUrl?.message} />

          {coverImageUrl ? (
            <div className="mt-4 rounded-[1.6rem] border border-slate-200 bg-[#fffaf2] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">
                  {coverPreviewUrl ? "Selected cover preview" : "Current cover image"}
                </p>
                {coverPreviewUrl ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={resetPrimaryImageSelection}
                  >
                    {product?.imageUrl ? "Use current image" : "Clear selected image"}
                  </Button>
                ) : null}
              </div>
              {/* Blob previews are rendered with a native image tag. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImageUrl}
                alt="Product cover preview"
                className="mt-4 h-44 w-full rounded-[1.4rem] object-cover md:w-72"
              />
            </div>
          ) : null}
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Gallery image uploads
          </label>
          <input
            ref={galleryImageInputRef}
            name="galleryImageFiles"
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
            onChange={(event) => {
              clearErrors("retainedGalleryImageUrls");
              setMessage(null);

              const files = Array.from(event.target.files ?? []);
              setSelectedGalleryFiles(files);
              setGalleryPreviewUrls(files.map((file) => URL.createObjectURL(file)));
            }}
            className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Optional. Keep up to 8 extra gallery images. The cover image stays first on the product page gallery.
          </p>
          <FieldError message={errors.retainedGalleryImageUrls?.message} />

          {retainedGalleryImageUrls.length ? (
            <div className="mt-4 rounded-[1.6rem] border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">
                  Current gallery images
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {retainedGalleryImageUrls.length} kept
                </p>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {retainedGalleryImageUrls.map((imageUrl) => (
                  <div
                    key={imageUrl}
                    className="rounded-[1.25rem] border border-slate-200 bg-[#fffaf2] p-3"
                  >
                    {/* Blob previews are rendered with a native image tag. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                      src={imageUrl}
                      alt="Gallery preview"
                      className="h-28 w-full rounded-[1rem] object-cover"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => {
                        setRetainedGalleryImageUrls((current) =>
                          current.filter((entry) => entry !== imageUrl),
                        );
                      }}
                    >
                      Remove image
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {galleryPreviewUrls.length ? (
            <div className="mt-4 rounded-[1.6rem] border border-slate-200 bg-[#fffaf2] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">
                  New gallery uploads
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={resetGalleryImageSelection}
                >
                  Clear selected uploads
                </Button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {galleryPreviewUrls.map((previewUrl, index) => (
                  <div
                    key={`${previewUrl}-${index}`}
                    className="rounded-[1.25rem] border border-slate-200 bg-white p-3"
                  >
                    {/* Blob previews are rendered with a native image tag. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                      src={previewUrl}
                      alt={`Selected gallery preview ${index + 1}`}
                      className="h-28 w-full rounded-[1rem] object-cover"
                    />
                    <p className="mt-3 text-xs text-slate-500">
                      {selectedGalleryFiles[index]?.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Description
          </label>
          <Textarea {...register("description")} />
          <FieldError message={errors.description?.message} />
        </div>
      </div>

      <div className="mt-6 rounded-[2rem] border border-slate-200 bg-[rgba(255,251,244,0.88)] p-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
            Product detail tabs
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            These fields appear as the fixed tabs below the product page:
            Information, Ingredients, Nutritional, and FAQ.
          </p>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Information
            </label>
            <Textarea
              rows={6}
              {...register("information")}
              placeholder="Product overview, usage notes, storage guidance..."
            />
            <FieldError message={errors.information?.message} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Ingredients
            </label>
            <Textarea
              rows={6}
              {...register("ingredients")}
              placeholder="Ingredient list, allergens, origin notes..."
            />
            <FieldError message={errors.ingredients?.message} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nutritional
            </label>
            <Textarea
              rows={6}
              {...register("nutritional")}
              placeholder="Nutrition facts, serving size, per-100g values..."
            />
            <FieldError message={errors.nutritional?.message} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              FAQ
            </label>
            <Textarea
              rows={6}
              {...register("faq")}
              placeholder="Common questions and answers for this product..."
            />
            <FieldError message={errors.faq?.message} />
          </div>
        </div>
      </div>

      {productType === "SIMPLE" ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {priceLabel}
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("normalPrice", { valueAsNumber: true })}
            />
            <FieldError message={errors.normalPrice?.message} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {wholesalePriceLabel}
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("wholesalePrice", { valueAsNumber: true })}
            />
            <FieldError message={errors.wholesalePrice?.message} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Stock quantity
            </label>
            <Input
              type="number"
              min="0"
              {...register("stockQuantity", { valueAsNumber: true })}
            />
            <FieldError message={errors.stockQuantity?.message} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Wholesale minimum quantity
            </label>
            <Input
              type="number"
              min="1"
              {...register("minOrderQuantity", { valueAsNumber: true })}
            />
            <FieldError message={errors.minOrderQuantity?.message} />
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-[2rem] border border-slate-200 bg-[rgba(255,251,244,0.88)] p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
                Variable product
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Add the purchasable options for this product. Catalog cards and
                filters will use the lowest active option total price and combined
                active stock.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append(buildVariantSeed(product))}
            >
              Add option
            </Button>
          </div>

          <div className="mt-5 max-w-sm">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Option label
            </label>
            <Input
              {...register("variantLabel")}
              placeholder="Pack size, weight, flavor..."
            />
            <FieldError message={errors.variantLabel?.message} />
          </div>

          {variantsError ? <FieldError message={variantsError} /> : null}

          <div className="mt-5 space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <input type="hidden" {...register(`variants.${index}.id`)} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Option {index + 1}
                    </p>
                    <p className="text-sm text-slate-500">
                      Customers will choose this option on the product page.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    Remove option
                  </Button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Option name
                    </label>
                    <Input
                      {...register(`variants.${index}.name`)}
                      placeholder="25kg sack"
                    />
                    <FieldError
                      message={errors.variants?.[index]?.name?.message}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Option SKU
                    </label>
                    <Input
                      {...register(`variants.${index}.sku`)}
                      placeholder="RICE-001-25"
                    />
                    <FieldError
                      message={errors.variants?.[index]?.sku?.message}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      {priceLabel}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`variants.${index}.normalPrice`, {
                        valueAsNumber: true,
                      })}
                    />
                    <FieldError
                      message={errors.variants?.[index]?.normalPrice?.message}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      {wholesalePriceLabel}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`variants.${index}.wholesalePrice`, {
                        valueAsNumber: true,
                      })}
                    />
                    <FieldError
                      message={
                        errors.variants?.[index]?.wholesalePrice?.message
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Stock quantity
                    </label>
                    <Input
                      type="number"
                      min="0"
                      {...register(`variants.${index}.stockQuantity`, {
                        valueAsNumber: true,
                      })}
                    />
                    <FieldError
                      message={errors.variants?.[index]?.stockQuantity?.message}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Wholesale minimum quantity
                    </label>
                    <Input
                      type="number"
                      min="1"
                      {...register(`variants.${index}.minOrderQuantity`, {
                        valueAsNumber: true,
                      })}
                    />
                    <FieldError
                      message={
                        errors.variants?.[index]?.minOrderQuantity?.message
                      }
                    />
                  </div>
                </div>

                <label className="mt-4 flex items-center gap-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    {...register(`variants.${index}.isActive`)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
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

      {message ? (
        <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {message}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving..."
            : product?.id
              ? "Save changes"
              : "Create product"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}




