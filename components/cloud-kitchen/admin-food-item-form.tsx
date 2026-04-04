"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { upsertFoodItemAction } from "@/lib/actions/cloud-kitchen-actions";
import { foodItemSchema } from "@/lib/validations/cloud-kitchen";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type FoodItemFormInput = z.input<typeof foodItemSchema>;
type FoodItemFormValues = z.output<typeof foodItemSchema>;

export function AdminFoodItemForm({
  item,
  kitchens,
  categories,
}: {
  item?: Partial<FoodItemFormInput>;
  kitchens: Array<{ id: string; name: string; isActive: boolean }>;
  categories: Array<{ id: string; name: string; isActive: boolean }>;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<
    FoodItemFormInput,
    unknown,
    FoodItemFormValues
  >({
    resolver: zodResolver(foodItemSchema),
    defaultValues: {
      id: item?.id,
      kitchenId: item?.kitchenId ?? kitchens[0]?.id,
      foodCategoryId: item?.foodCategoryId ?? categories[0]?.id,
      name: item?.name ?? "",
      slug: item?.slug ?? "",
      shortDescription: item?.shortDescription ?? "",
      description: item?.description ?? "",
      imageUrl: item?.imageUrl ?? "",
      price: item?.price ?? 0,
      compareAtPrice: item?.compareAtPrice ?? null,
      isAvailable: item?.isAvailable ?? true,
      isFeatured: item?.isFeatured ?? false,
      sortOrder: item?.sortOrder ?? 0,
      preparationTimeMins: item?.preparationTimeMins ?? null,
    },
  });

  return (
    <form
      className="space-y-5 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5"
      onSubmit={handleSubmit((values) => {
        setMessage(null);
        startTransition(async () => {
          const result = await upsertFoodItemAction(values);
          setMessage(result.success ? result.message ?? null : result.error);
          if (result.success) {
            router.push("/admin/cloud-kitchen/foods");
            router.refresh();
          }
        });
      })}
    >
      <input type="hidden" {...register("id")} />
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="admin-label">Kitchen</label>
          <Select {...register("kitchenId")}>
            {kitchens.map((kitchen) => (
              <option key={kitchen.id} value={kitchen.id}>
                {kitchen.name}
              </option>
            ))}
          </Select>
          <FieldError message={errors.kitchenId?.message} />
        </div>
        <div>
          <label className="admin-label">Food category</label>
          <Select {...register("foodCategoryId")}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <FieldError message={errors.foodCategoryId?.message} />
        </div>
        <div>
          <label className="admin-label">Item name</label>
          <Input {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <label className="admin-label">Slug</label>
          <Input {...register("slug")} placeholder="Auto-generated if empty" />
          <FieldError message={errors.slug?.message} />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Short description</label>
          <Input {...register("shortDescription")} />
          <FieldError message={errors.shortDescription?.message} />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Description</label>
          <Textarea {...register("description")} className="min-h-28" />
          <FieldError message={errors.description?.message} />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Image URL</label>
          <Input {...register("imageUrl")} placeholder="https://..." />
          <FieldError message={errors.imageUrl?.message} />
        </div>
        <div>
          <label className="admin-label">Price</label>
          <Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
          <FieldError message={errors.price?.message} />
        </div>
        <div>
          <label className="admin-label">Compare-at price</label>
          <Input type="number" step="0.01" {...register("compareAtPrice", { valueAsNumber: true })} />
          <FieldError message={errors.compareAtPrice?.message} />
        </div>
        <div>
          <label className="admin-label">Preparation time (mins)</label>
          <Input type="number" {...register("preparationTimeMins", { valueAsNumber: true })} />
          <FieldError message={errors.preparationTimeMins?.message} />
        </div>
        <div>
          <label className="admin-label">Sort order</label>
          <Input type="number" {...register("sortOrder", { valueAsNumber: true })} />
          <FieldError message={errors.sortOrder?.message} />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-[0.8rem] font-medium text-[var(--admin-foreground)]">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("isAvailable")} className="h-4 w-4 rounded border-[var(--admin-border)]" />
          Available on menu
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("isFeatured")} className="h-4 w-4 rounded border-[var(--admin-border)]" />
          Featured item
        </label>
      </div>

      {message ? (
        <p className="rounded-xl bg-[var(--admin-surface-muted)] px-4 py-3 text-[0.78rem] text-[var(--admin-muted-foreground)]">
          {message}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : item?.id ? "Save food item" : "Create food item"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/cloud-kitchen/foods")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

