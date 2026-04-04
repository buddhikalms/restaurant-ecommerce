"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { upsertKitchenAction } from "@/lib/actions/cloud-kitchen-actions";
import { kitchenSchema } from "@/lib/validations/cloud-kitchen";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type KitchenFormInput = z.input<typeof kitchenSchema>;
type KitchenFormValues = z.output<typeof kitchenSchema>;

export function AdminKitchenForm({
  kitchen,
}: {
  kitchen?: Partial<KitchenFormInput>;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<
    KitchenFormInput,
    unknown,
    KitchenFormValues
  >({
    resolver: zodResolver(kitchenSchema),
    defaultValues: {
      id: kitchen?.id,
      name: kitchen?.name ?? "",
      slug: kitchen?.slug ?? "",
      description: kitchen?.description ?? "",
      phone: kitchen?.phone ?? "",
      email: kitchen?.email ?? "",
      addressLine1: kitchen?.addressLine1 ?? "",
      addressLine2: kitchen?.addressLine2 ?? "",
      city: kitchen?.city ?? "",
      state: kitchen?.state ?? "",
      postalCode: kitchen?.postalCode ?? "",
      country: kitchen?.country ?? "Sri Lanka",
      latitude: kitchen?.latitude ?? 6.9271,
      longitude: kitchen?.longitude ?? 79.8612,
      maxDeliveryDistanceKm: kitchen?.maxDeliveryDistanceKm ?? 10,
      minimumOrderAmount: kitchen?.minimumOrderAmount ?? 0,
      deliveryFee: kitchen?.deliveryFee ?? 0,
      freeDeliveryMinimum: kitchen?.freeDeliveryMinimum ?? null,
      preparationTimeMins: kitchen?.preparationTimeMins ?? 30,
      isActive: kitchen?.isActive ?? true,
      acceptsOrders: kitchen?.acceptsOrders ?? true,
      sortOrder: kitchen?.sortOrder ?? 0,
    },
  });

  return (
    <form
      className="space-y-5 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5"
      onSubmit={handleSubmit((values) => {
        setMessage(null);
        startTransition(async () => {
          const result = await upsertKitchenAction(values);
          setMessage(result.success ? result.message ?? null : result.error);

          if (result.success) {
            router.push("/admin/cloud-kitchen/kitchens");
            router.refresh();
          }
        });
      })}
    >
      <input type="hidden" {...register("id")} />
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="admin-label">Kitchen name</label>
          <Input {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <label className="admin-label">Slug</label>
          <Input {...register("slug")} placeholder="Auto-generated if empty" />
          <FieldError message={errors.slug?.message} />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Description</label>
          <Textarea {...register("description")} className="min-h-24" />
          <FieldError message={errors.description?.message} />
        </div>
        <div>
          <label className="admin-label">Phone</label>
          <Input {...register("phone")} />
          <FieldError message={errors.phone?.message} />
        </div>
        <div>
          <label className="admin-label">Email</label>
          <Input type="email" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <label className="admin-label">Address line 1</label>
          <Input {...register("addressLine1")} />
          <FieldError message={errors.addressLine1?.message} />
        </div>
        <div>
          <label className="admin-label">Address line 2</label>
          <Input {...register("addressLine2")} />
          <FieldError message={errors.addressLine2?.message} />
        </div>
        <div>
          <label className="admin-label">City</label>
          <Input {...register("city")} />
          <FieldError message={errors.city?.message} />
        </div>
        <div>
          <label className="admin-label">State</label>
          <Input {...register("state")} />
          <FieldError message={errors.state?.message} />
        </div>
        <div>
          <label className="admin-label">Postal code</label>
          <Input {...register("postalCode")} />
          <FieldError message={errors.postalCode?.message} />
        </div>
        <div>
          <label className="admin-label">Country</label>
          <Input {...register("country")} />
          <FieldError message={errors.country?.message} />
        </div>
        <div>
          <label className="admin-label">Latitude</label>
          <Input type="number" step="0.0000001" {...register("latitude", { valueAsNumber: true })} />
          <FieldError message={errors.latitude?.message} />
        </div>
        <div>
          <label className="admin-label">Longitude</label>
          <Input type="number" step="0.0000001" {...register("longitude", { valueAsNumber: true })} />
          <FieldError message={errors.longitude?.message} />
        </div>
        <div>
          <label className="admin-label">Max delivery distance (km)</label>
          <Input type="number" step="0.1" {...register("maxDeliveryDistanceKm", { valueAsNumber: true })} />
          <FieldError message={errors.maxDeliveryDistanceKm?.message} />
        </div>
        <div>
          <label className="admin-label">Minimum order amount</label>
          <Input type="number" step="0.01" {...register("minimumOrderAmount", { valueAsNumber: true })} />
          <FieldError message={errors.minimumOrderAmount?.message} />
        </div>
        <div>
          <label className="admin-label">Base delivery fee</label>
          <Input type="number" step="0.01" {...register("deliveryFee", { valueAsNumber: true })} />
          <FieldError message={errors.deliveryFee?.message} />
        </div>
        <div>
          <label className="admin-label">Free delivery minimum</label>
          <Input type="number" step="0.01" {...register("freeDeliveryMinimum", { valueAsNumber: true })} />
          <FieldError message={errors.freeDeliveryMinimum?.message} />
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
          <input type="checkbox" {...register("isActive")} className="h-4 w-4 rounded border-[var(--admin-border)]" />
          Kitchen is active
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("acceptsOrders")} className="h-4 w-4 rounded border-[var(--admin-border)]" />
          Accepting orders
        </label>
      </div>

      {message ? (
        <p className="rounded-xl bg-[var(--admin-surface-muted)] px-4 py-3 text-[0.78rem] text-[var(--admin-muted-foreground)]">
          {message}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : kitchen?.id ? "Save kitchen" : "Create kitchen"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/cloud-kitchen/kitchens")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

