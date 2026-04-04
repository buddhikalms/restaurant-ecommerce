"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { upsertDeliveryZoneAction } from "@/lib/actions/cloud-kitchen-actions";
import { deliveryZoneSchema } from "@/lib/validations/cloud-kitchen";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type DeliveryZoneFormInput = z.input<typeof deliveryZoneSchema>;
type DeliveryZoneFormValues = z.output<typeof deliveryZoneSchema>;

function serializePolygon(points?: Array<{ latitude: number; longitude: number }> | Array<{ latitude: unknown; longitude: unknown }>) {
  return (points ?? []).map((point) => `${point.latitude},${point.longitude}`).join("\n");
}

function parsePolygon(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [latitude, longitude] = line.split(",").map((part) => Number(part.trim()));
      return { latitude, longitude };
    })
    .filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude));
}

export function AdminDeliveryZoneForm({
  zone,
  kitchens,
}: {
  zone?: Partial<DeliveryZoneFormInput>;
  kitchens: Array<{ id: string; name: string; isActive: boolean }>;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [polygonText, setPolygonText] = useState(serializePolygon(zone?.polygonCoordinates));
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, control, formState: { errors } } = useForm<
    DeliveryZoneFormInput,
    unknown,
    DeliveryZoneFormValues
  >({
    resolver: zodResolver(deliveryZoneSchema),
    defaultValues: {
      id: zone?.id,
      kitchenId: zone?.kitchenId ?? kitchens[0]?.id,
      name: zone?.name ?? "",
      description: zone?.description ?? "",
      zoneType: zone?.zoneType ?? "RADIUS",
      centerLatitude: zone?.centerLatitude ?? null,
      centerLongitude: zone?.centerLongitude ?? null,
      radiusKm: zone?.radiusKm ?? 5,
      polygonCoordinates: zone?.polygonCoordinates ?? [],
      deliveryFee: zone?.deliveryFee ?? null,
      minimumOrderAmount: zone?.minimumOrderAmount ?? null,
      freeDeliveryMinimum: zone?.freeDeliveryMinimum ?? null,
      isActive: zone?.isActive ?? true,
      sortOrder: zone?.sortOrder ?? 0,
    },
  });
  const zoneType = useWatch({ control, name: "zoneType" }) ?? "RADIUS";
  const polygonPreview = useMemo(() => parsePolygon(polygonText), [polygonText]);

  return (
    <form
      className="space-y-5 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5"
      onSubmit={handleSubmit((values) => {
        setMessage(null);
        startTransition(async () => {
          const result = await upsertDeliveryZoneAction({
            ...values,
            polygonCoordinates: polygonPreview,
          });
          setMessage(result.success ? result.message ?? null : result.error);
          if (result.success) {
            router.push("/admin/cloud-kitchen/delivery-zones");
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
          <label className="admin-label">Zone name</label>
          <Input {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <label className="admin-label">Zone type</label>
          <Select {...register("zoneType")}>
            <option value="RADIUS">Radius</option>
            <option value="POLYGON">Polygon</option>
          </Select>
          <FieldError message={errors.zoneType?.message} />
        </div>
        <div>
          <label className="admin-label">Sort order</label>
          <Input type="number" {...register("sortOrder", { valueAsNumber: true })} />
          <FieldError message={errors.sortOrder?.message} />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Description</label>
          <Textarea {...register("description")} className="min-h-24" />
          <FieldError message={errors.description?.message} />
        </div>
        {zoneType === "RADIUS" ? (
          <>
            <div>
              <label className="admin-label">Center latitude</label>
              <Input type="number" step="0.0000001" {...register("centerLatitude", { valueAsNumber: true })} />
              <FieldError message={errors.centerLatitude?.message} />
            </div>
            <div>
              <label className="admin-label">Center longitude</label>
              <Input type="number" step="0.0000001" {...register("centerLongitude", { valueAsNumber: true })} />
              <FieldError message={errors.centerLongitude?.message} />
            </div>
            <div>
              <label className="admin-label">Radius (km)</label>
              <Input type="number" step="0.1" {...register("radiusKm", { valueAsNumber: true })} />
              <FieldError message={errors.radiusKm?.message} />
            </div>
          </>
        ) : (
          <div className="md:col-span-2">
            <label className="admin-label">Polygon coordinates</label>
            <Textarea
              value={polygonText}
              onChange={(event) => setPolygonText(event.target.value)}
              className="min-h-36"
              placeholder="6.9271,79.8612&#10;6.9290,79.8690&#10;6.9204,79.8705"
            />
            <p className="mt-2 text-[0.76rem] text-[var(--admin-muted-foreground)]">
              One latitude,longitude pair per line.
            </p>
            <FieldError message={errors.polygonCoordinates?.message as string | undefined} />
          </div>
        )}
        <div>
          <label className="admin-label">Delivery fee override</label>
          <Input type="number" step="0.01" {...register("deliveryFee", { valueAsNumber: true })} />
          <FieldError message={errors.deliveryFee?.message} />
        </div>
        <div>
          <label className="admin-label">Minimum order override</label>
          <Input type="number" step="0.01" {...register("minimumOrderAmount", { valueAsNumber: true })} />
          <FieldError message={errors.minimumOrderAmount?.message} />
        </div>
        <div>
          <label className="admin-label">Free delivery threshold</label>
          <Input type="number" step="0.01" {...register("freeDeliveryMinimum", { valueAsNumber: true })} />
          <FieldError message={errors.freeDeliveryMinimum?.message} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-[0.8rem] font-medium text-[var(--admin-foreground)]">
        <input type="checkbox" {...register("isActive")} className="h-4 w-4 rounded border-[var(--admin-border)]" />
        Zone is active
      </label>

      {message ? (
        <p className="rounded-xl bg-[var(--admin-surface-muted)] px-4 py-3 text-[0.78rem] text-[var(--admin-muted-foreground)]">
          {message}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : zone?.id ? "Save delivery zone" : "Create delivery zone"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/cloud-kitchen/delivery-zones")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}


