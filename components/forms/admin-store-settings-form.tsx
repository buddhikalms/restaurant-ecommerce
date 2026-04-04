"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { upsertStoreSettingsAction } from "@/lib/actions/admin-actions"
import { storeSettingsSchema } from "@/lib/validations/admin-commerce"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field-error"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type StoreSettingsFormInput = z.input<typeof storeSettingsSchema>
type StoreSettingsFormValues = z.output<typeof storeSettingsSchema>

export function AdminStoreSettingsForm({
  settings,
}: {
  settings: {
    deliveryNotes?: string | null
    defaultHandlingFee: number
    weightUnit: string
    dimensionUnit: string
    mapsEnabled: boolean
    googleMapsApiKey?: string | null
    defaultMapLatitude?: number | null
    defaultMapLongitude?: number | null
    defaultMapZoom: number
    storeLocationName?: string | null
    storeAddress?: string | null
    storeLatitude?: number | null
    storeLongitude?: number | null
    serviceAreaCountries: string[]
  }
}) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const form = useForm<StoreSettingsFormInput, unknown, StoreSettingsFormValues>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      deliveryNotes: settings.deliveryNotes ?? "",
      defaultHandlingFee: settings.defaultHandlingFee,
      weightUnit: settings.weightUnit,
      dimensionUnit: settings.dimensionUnit,
      mapsEnabled: settings.mapsEnabled,
      googleMapsApiKey: settings.googleMapsApiKey ?? "",
      defaultMapLatitude: settings.defaultMapLatitude ?? undefined,
      defaultMapLongitude: settings.defaultMapLongitude ?? undefined,
      defaultMapZoom: settings.defaultMapZoom,
      storeLocationName: settings.storeLocationName ?? "",
      storeAddress: settings.storeAddress ?? "",
      storeLatitude: settings.storeLatitude ?? undefined,
      storeLongitude: settings.storeLongitude ?? undefined,
      serviceAreaCountriesText: settings.serviceAreaCountries.join("\n"),
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        setMessage(null)
        startTransition(async () => {
          const result = await upsertStoreSettingsAction(values)
          setMessage(result.success ? result.message ?? null : result.error)
          router.refresh()
        })
      })}
    >
      <section className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4">
        <h3 className="text-sm font-semibold text-[var(--admin-foreground)]">Delivery defaults</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="admin-label">Default handling fee</label>
            <Input type="number" step="0.01" {...form.register("defaultHandlingFee", { valueAsNumber: true })} />
            <FieldError message={form.formState.errors.defaultHandlingFee?.message} />
          </div>
          <div>
            <label className="admin-label">Weight unit</label>
            <Input {...form.register("weightUnit")} />
            <FieldError message={form.formState.errors.weightUnit?.message} />
          </div>
          <div>
            <label className="admin-label">Dimension unit</label>
            <Input {...form.register("dimensionUnit")} />
            <FieldError message={form.formState.errors.dimensionUnit?.message} />
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Delivery notes shown at checkout</label>
            <Textarea {...form.register("deliveryNotes")} className="min-h-24" />
            <FieldError message={form.formState.errors.deliveryNotes?.message} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--admin-foreground)]">Google Maps</h3>
            <p className="mt-1 text-[0.78rem] text-[var(--admin-muted-foreground)]">
              Use a browser-restricted Maps key for checkout autocomplete and local delivery coordinates.
            </p>
          </div>
          <label className="flex items-center gap-2 text-[0.8rem] text-[var(--admin-foreground)]">
            <input type="checkbox" {...form.register("mapsEnabled")} className="h-4 w-4 rounded border-[var(--admin-border)]" />
            Enable Maps
          </label>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="admin-label">Google Maps API key</label>
            <Input {...form.register("googleMapsApiKey")} placeholder="AIza..." />
            <FieldError message={form.formState.errors.googleMapsApiKey?.message} />
          </div>
          <div>
            <label className="admin-label">Default latitude</label>
            <Input type="number" step="0.000001" {...form.register("defaultMapLatitude", { valueAsNumber: true })} />
            <FieldError message={form.formState.errors.defaultMapLatitude?.message} />
          </div>
          <div>
            <label className="admin-label">Default longitude</label>
            <Input type="number" step="0.000001" {...form.register("defaultMapLongitude", { valueAsNumber: true })} />
            <FieldError message={form.formState.errors.defaultMapLongitude?.message} />
          </div>
          <div>
            <label className="admin-label">Default zoom</label>
            <Input type="number" {...form.register("defaultMapZoom", { valueAsNumber: true })} />
            <FieldError message={form.formState.errors.defaultMapZoom?.message} />
          </div>
          <div>
            <label className="admin-label">Store location name</label>
            <Input {...form.register("storeLocationName")} />
            <FieldError message={form.formState.errors.storeLocationName?.message} />
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Store address</label>
            <Textarea {...form.register("storeAddress")} className="min-h-20" />
            <FieldError message={form.formState.errors.storeAddress?.message} />
          </div>
          <div>
            <label className="admin-label">Store latitude</label>
            <Input type="number" step="0.000001" {...form.register("storeLatitude", { valueAsNumber: true })} />
            <FieldError message={form.formState.errors.storeLatitude?.message} />
          </div>
          <div>
            <label className="admin-label">Store longitude</label>
            <Input type="number" step="0.000001" {...form.register("storeLongitude", { valueAsNumber: true })} />
            <FieldError message={form.formState.errors.storeLongitude?.message} />
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Allowed / service area countries</label>
            <Textarea
              {...form.register("serviceAreaCountriesText")}
              className="min-h-20"
              placeholder="USA&#10;Canada"
            />
            <FieldError message={form.formState.errors.serviceAreaCountriesText?.message} />
          </div>
        </div>
      </section>

      {message ? (
        <p className="rounded-xl bg-[var(--admin-surface)] px-3 py-2 text-[0.76rem] text-[var(--admin-muted-foreground)]">
          {message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving settings..." : "Save store settings"}
      </Button>
    </form>
  )
}


