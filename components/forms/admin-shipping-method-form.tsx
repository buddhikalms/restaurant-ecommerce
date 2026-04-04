"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { deleteShippingMethodAction, upsertShippingMethodAction } from "@/lib/actions/admin-actions"
import { SHIPPING_METHOD_LABELS } from "@/lib/commerce/constants"
import { shippingMethodSchema } from "@/lib/validations/admin-commerce"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field-error"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type ShippingMethodFormInput = z.input<typeof shippingMethodSchema>
type ShippingMethodFormValues = z.output<typeof shippingMethodSchema>

export function AdminShippingMethodForm({
  shippingZoneId,
  method,
}: {
  shippingZoneId: string
  method?: Partial<ShippingMethodFormValues>
}) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const form = useForm<ShippingMethodFormInput, unknown, ShippingMethodFormValues>({
    resolver: zodResolver(shippingMethodSchema),
    defaultValues: {
      id: method?.id,
      shippingZoneId,
      name: method?.name ?? "",
      description: method?.description ?? "",
      type: method?.type ?? "FLAT_RATE",
      baseCost: method?.baseCost ?? 0,
      minimumOrderAmount: method?.minimumOrderAmount ?? undefined,
      maximumOrderAmount: method?.maximumOrderAmount ?? undefined,
      minimumWeight: method?.minimumWeight ?? undefined,
      maximumWeight: method?.maximumWeight ?? undefined,
      freeShippingMinimum: method?.freeShippingMinimum ?? undefined,
      maximumDistanceKm: method?.maximumDistanceKm ?? undefined,
      sortOrder: method?.sortOrder ?? 0,
      estimatedMinDays: method?.estimatedMinDays ?? undefined,
      estimatedMaxDays: method?.estimatedMaxDays ?? undefined,
      instructions: method?.instructions ?? "",
      isEnabled: method?.isEnabled ?? true,
      codAllowed: method?.codAllowed ?? false,
      tiers: method?.tiers ?? [],
    },
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tiers",
  })

  return (
    <form
      className="space-y-4 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4"
      onSubmit={form.handleSubmit((values) => {
        setMessage(null)
        startTransition(async () => {
          const result = await upsertShippingMethodAction(values)
          setMessage(result.success ? result.message ?? null : result.error)
          router.refresh()
        })
      })}
    >
      <input type="hidden" {...form.register("id")} />
      <input type="hidden" {...form.register("shippingZoneId")} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <label className="admin-label">Method name</label>
          <Input {...form.register("name")} />
          <FieldError message={form.formState.errors.name?.message} />
        </div>
        <div>
          <label className="admin-label">Type</label>
          <Select {...form.register("type")}>
            {Object.entries(SHIPPING_METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <FieldError message={form.formState.errors.type?.message} />
        </div>
        <div>
          <label className="admin-label">Sort order</label>
          <Input type="number" {...form.register("sortOrder", { valueAsNumber: true })} />
          <FieldError message={form.formState.errors.sortOrder?.message} />
        </div>
        <div>
          <label className="admin-label">Base cost</label>
          <Input type="number" step="0.01" {...form.register("baseCost", { valueAsNumber: true })} />
          <FieldError message={form.formState.errors.baseCost?.message} />
        </div>
        <div>
          <label className="admin-label">Min cart amount</label>
          <Input type="number" step="0.01" {...form.register("minimumOrderAmount", { valueAsNumber: true })} />
          <FieldError message={form.formState.errors.minimumOrderAmount?.message} />
        </div>
        <div>
          <label className="admin-label">Max cart amount</label>
          <Input type="number" step="0.01" {...form.register("maximumOrderAmount", { valueAsNumber: true })} />
          <FieldError message={form.formState.errors.maximumOrderAmount?.message} />
        </div>
        <div>
          <label className="admin-label">Min weight</label>
          <Input type="number" step="0.01" {...form.register("minimumWeight", { valueAsNumber: true })} />
          <FieldError message={form.formState.errors.minimumWeight?.message} />
        </div>
        <div>
          <label className="admin-label">Max weight</label>
          <Input type="number" step="0.01" {...form.register("maximumWeight", { valueAsNumber: true })} />
          <FieldError message={form.formState.errors.maximumWeight?.message} />
        </div>
        <div>
          <label className="admin-label">Free shipping threshold</label>
          <Input type="number" step="0.01" {...form.register("freeShippingMinimum", { valueAsNumber: true })} />
          <FieldError message={form.formState.errors.freeShippingMinimum?.message} />
        </div>
        <div>
          <label className="admin-label">Maximum distance (km)</label>
          <Input type="number" step="0.01" {...form.register("maximumDistanceKm", { valueAsNumber: true })} />
          <FieldError message={form.formState.errors.maximumDistanceKm?.message} />
        </div>
        <div>
          <label className="admin-label">Estimated min days</label>
          <Input type="number" {...form.register("estimatedMinDays", { valueAsNumber: true })} />
          <FieldError message={form.formState.errors.estimatedMinDays?.message} />
        </div>
        <div>
          <label className="admin-label">Estimated max days</label>
          <Input type="number" {...form.register("estimatedMaxDays", { valueAsNumber: true })} />
          <FieldError message={form.formState.errors.estimatedMaxDays?.message} />
        </div>
        <div className="md:col-span-2 xl:col-span-3">
          <label className="admin-label">Description</label>
          <Textarea {...form.register("description")} className="min-h-20" />
          <FieldError message={form.formState.errors.description?.message} />
        </div>
        <div className="md:col-span-2 xl:col-span-3">
          <label className="admin-label">Instructions shown at checkout</label>
          <Textarea {...form.register("instructions")} className="min-h-20" />
          <FieldError message={form.formState.errors.instructions?.message} />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-[0.8rem] text-[var(--admin-foreground)]">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...form.register("isEnabled")} className="h-4 w-4 rounded border-[var(--admin-border)]" />
          Enabled
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...form.register("codAllowed")} className="h-4 w-4 rounded border-[var(--admin-border)]" />
          Allow COD for this method
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="admin-label">Rate tiers / variations</p>
            <p className="text-[0.76rem] text-[var(--admin-muted-foreground)]">
              Use tiers for weight-based, price-based, or distance-based delivery variations.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              append({
                label: "",
                minimumValue: undefined,
                maximumValue: undefined,
                cost: 0,
                sortOrder: fields.length,
              })
            }
          >
            Add tier
          </Button>
        </div>
        {fields.length ? (
          fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3">
              <div className="grid gap-3 lg:grid-cols-5">
                <Input placeholder="Label" {...form.register(`tiers.${index}.label`)} />
                <Input type="number" step="0.01" placeholder="Min" {...form.register(`tiers.${index}.minimumValue`, { valueAsNumber: true })} />
                <Input type="number" step="0.01" placeholder="Max" {...form.register(`tiers.${index}.maximumValue`, { valueAsNumber: true })} />
                <Input type="number" step="0.01" placeholder="Cost" {...form.register(`tiers.${index}.cost`, { valueAsNumber: true })} />
                <div className="flex gap-2">
                  <Input type="number" placeholder="Sort" {...form.register(`tiers.${index}.sortOrder`, { valueAsNumber: true })} />
                  <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-[0.76rem] text-[var(--admin-muted-foreground)]">
            No tiers configured. Base cost will be used.
          </p>
        )}
      </div>

      {message ? (
        <p className="rounded-xl bg-[var(--admin-surface-muted)] px-3 py-2 text-[0.76rem] text-[var(--admin-muted-foreground)]">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving method..." : method?.id ? "Save method" : "Add method"}
        </Button>
        {method?.id ? (
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              if (!window.confirm("Delete this shipping method?")) {
                return
              }

              startTransition(async () => {
                const result = await deleteShippingMethodAction(method.id as string)
                setMessage(result.success ? result.message ?? null : result.error)
                router.refresh()
              })
            }}
          >
            Delete method
          </Button>
        ) : null}
      </div>
    </form>
  )
}


