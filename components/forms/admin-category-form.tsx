"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { upsertCategoryAction } from "@/lib/actions/admin-actions";
import { categorySchema } from "@/lib/validations/admin";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CategoryFormInput = z.input<typeof categorySchema>;
type CategoryFormValues = z.output<typeof categorySchema>;

export function AdminCategoryForm({
  category,
  submitLabel = "Save category",
}: {
  category?: Partial<CategoryFormInput>;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      id: category?.id,
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      isActive: category?.isActive ?? true,
    },
  });
  const isActive = useWatch({ control, name: "isActive" }) ?? true;

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) => {
        setMessage(null);
        startTransition(async () => {
          const result = await upsertCategoryAction(values);
          setMessage(result.success ? result.message ?? null : result.error);
          router.refresh();
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
        <Textarea {...register("description")} className="min-h-20" />
        <FieldError message={errors.description?.message} />
      </div>
      <label className="flex items-center gap-3 text-[0.8rem] font-medium text-[var(--admin-foreground)]">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => setValue("isActive", event.target.checked)}
          className="h-4 w-4 rounded border-[var(--admin-border)]"
        />
        Category is active
      </label>
      {message ? (
        <p className="rounded-xl bg-[var(--admin-surface)] px-3 py-2 text-[0.76rem] text-[var(--admin-muted-foreground)]">
          {message}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
