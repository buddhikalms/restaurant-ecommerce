"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { upsertFoodCategoryAction } from "@/lib/actions/cloud-kitchen-actions";
import { foodCategorySchema } from "@/lib/validations/cloud-kitchen";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CategoryFormInput = z.input<typeof foodCategorySchema>;
type CategoryFormValues = z.output<typeof foodCategorySchema>;

export function AdminFoodCategoryForm({ category }: { category?: Partial<CategoryFormInput> }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<
    CategoryFormInput,
    unknown,
    CategoryFormValues
  >({
    resolver: zodResolver(foodCategorySchema),
    defaultValues: {
      id: category?.id,
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      sortOrder: category?.sortOrder ?? 0,
      isActive: category?.isActive ?? true,
    },
  });

  return (
    <form
      className="space-y-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5"
      onSubmit={handleSubmit((values) => {
        setMessage(null);
        startTransition(async () => {
          const result = await upsertFoodCategoryAction(values);
          setMessage(result.success ? result.message ?? null : result.error);
          if (result.success) {
            router.push("/admin/cloud-kitchen/categories");
            router.refresh();
          }
        });
      })}
    >
      <input type="hidden" {...register("id")} />
      <div>
        <label className="admin-label">Category name</label>
        <Input {...register("name")} />
        <FieldError message={errors.name?.message} />
      </div>
      <div>
        <label className="admin-label">Slug</label>
        <Input {...register("slug")} placeholder="Auto-generated if empty" />
        <FieldError message={errors.slug?.message} />
      </div>
      <div>
        <label className="admin-label">Description</label>
        <Textarea {...register("description")} className="min-h-24" />
        <FieldError message={errors.description?.message} />
      </div>
      <div>
        <label className="admin-label">Sort order</label>
        <Input type="number" {...register("sortOrder", { valueAsNumber: true })} />
        <FieldError message={errors.sortOrder?.message} />
      </div>
      <label className="flex items-center gap-2 text-[0.8rem] font-medium text-[var(--admin-foreground)]">
        <input type="checkbox" {...register("isActive")} className="h-4 w-4 rounded border-[var(--admin-border)]" />
        Category is active
      </label>
      {message ? (
        <p className="rounded-xl bg-[var(--admin-surface-muted)] px-4 py-3 text-[0.78rem] text-[var(--admin-muted-foreground)]">
          {message}
        </p>
      ) : null}
      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : category?.id ? "Save category" : "Create category"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/cloud-kitchen/categories")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

