"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { deleteShippingZoneAction, upsertShippingZoneAction } from "@/lib/actions/admin-actions"
import { shippingZoneSchema } from "@/lib/validations/admin-commerce"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field-error"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type ShippingZoneFormInput = z.input<typeof shippingZoneSchema>
type ShippingZoneFormValues = z.output<typeof shippingZoneSchema>

export function AdminShippingZoneForm({
  zone,
  submitLabel = "Save zone",
}: {
  zone?: Partial<ShippingZoneFormValues>
  submitLabel?: string
}) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const form = useForm<ShippingZoneFormInput, unknown, ShippingZoneFormValues>({
    resolver: zodResolver(shippingZoneSchema),
    defaultValues: {
      id: zone?.id,
      name: zone?.name ?? "",
      description: zone?.description ?? "",
      isEnabled: zone?.isEnabled ?? true,
      sortOrder: zone?.sortOrder ?? 0,
      regions:
        zone?.regions?.length ?? 0
          ? zone?.regions
          : [
              {
                country: "",
                state: "",
                city: "",
                postalCodePattern: "",
                sortOrder: 0,
              },
            ],
    },
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "regions",
  })
  const isEnabled = useWatch({ control: form.control, name: "isEnabled" }) ?? true

  return (
    <form
      className="space-y-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4"
      onSubmit={form.handleSubmit((values) => {
        setMessage(null)
        startTransition(async () => {
          const result = await upsertShippingZoneAction(values)
          setMessage(result.success ? result.message ?? null : result.error)
          router.refresh()
        })
      })}
    >
      <input type="hidden" {...form.register("id")} />
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="admin-label">Zone name</label>
          <Input {...form.register("name")} />
          <FieldError message={form.formState.errors.name?.message} />
        </div>
        <div>
          <label className="admin-label">Sort order</label>
          <Input type="number" {...form.register("sortOrder", { valueAsNumber: true })} />
          <FieldError message={form.formState.errors.sortOrder?.message} />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Description</label>
          <Textarea {...form.register("description")} className="min-h-20" />
          <FieldError message={form.formState.errors.description?.message} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-[0.8rem] text-[var(--admin-foreground)]">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(event) => form.setValue("isEnabled", event.target.checked, { shouldDirty: true })}
          className="h-4 w-4 rounded border-[var(--admin-border)]"
        />
        Zone enabled
      </label>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="admin-label">Matching regions</p>
            <p className="text-[0.76rem] text-[var(--admin-muted-foreground)]">
              Leave fields blank to create a broad fallback rule. Postal code supports wildcards like `98*`.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              append({
                country: "",
                state: "",
                city: "",
                postalCodePattern: "",
                sortOrder: fields.length,
              })
            }
          >
            Add region
          </Button>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3">
            <div className="grid gap-3 lg:grid-cols-5">
              <Input placeholder="Country" {...form.register(`regions.${index}.country`)} />
              <Input placeholder="State / province" {...form.register(`regions.${index}.state`)} />
              <Input placeholder="City" {...form.register(`regions.${index}.city`)} />
              <Input placeholder="Postal / ZIP" {...form.register(`regions.${index}.postalCodePattern`)} />
              <div className="flex gap-2">
                <Input type="number" placeholder="Sort" {...form.register(`regions.${index}.sortOrder`, { valueAsNumber: true })} />
                <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                  Remove
                </Button>
              </div>
            </div>
            <FieldError message={form.formState.errors.regions?.[index]?.country?.message} />
          </div>
        ))}
      </div>

      {message ? (
        <p className="rounded-xl bg-[var(--admin-surface)] px-3 py-2 text-[0.76rem] text-[var(--admin-muted-foreground)]">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving zone..." : submitLabel}
        </Button>
        {zone?.id ? (
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              if (!window.confirm("Delete this shipping zone and its methods?")) {
                return
              }

              startTransition(async () => {
                const result = await deleteShippingZoneAction(zone.id as string)
                setMessage(result.success ? result.message ?? null : result.error)
                router.refresh()
              })
            }}
          >
            Delete zone
          </Button>
        ) : null}
      </div>
    </form>
  )
}


