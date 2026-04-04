"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { upsertPaymentMethodSettingAction } from "@/lib/actions/admin-actions"
import {
  PAYMENT_GATEWAY_LABELS,
  SHIPPING_METHOD_LABELS,
} from "@/lib/commerce/constants"
import { paymentMethodSettingSchema } from "@/lib/validations/admin-commerce"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field-error"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type PaymentMethodFormInput = z.input<typeof paymentMethodSettingSchema>
type PaymentMethodFormValues = z.output<typeof paymentMethodSettingSchema>

export function AdminPaymentMethodForm({
  setting,
  zones,
}: {
  setting: {
    gateway: PaymentMethodFormValues["gateway"]
    displayName: string
    instructions?: string | null
    isEnabled: boolean
    mode: PaymentMethodFormValues["mode"]
    publicKey?: string | null
    secretKey?: string | null
    webhookSecret?: string | null
    extraFee: number
    minimumOrderAmount?: number | null
    maximumOrderAmount?: number | null
    allowedShippingMethodTypes: string[]
    allowedZoneIds: string[]
  }
  zones: Array<{ id: string; name: string }>
}) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const form = useForm<PaymentMethodFormInput, unknown, PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSettingSchema),
    defaultValues: {
      gateway: setting.gateway,
      displayName: setting.displayName,
      instructions: setting.instructions ?? "",
      isEnabled: setting.isEnabled,
      mode: setting.mode,
      publicKey: setting.publicKey ?? "",
      secretKey: setting.secretKey ?? "",
      webhookSecret: setting.webhookSecret ?? "",
      extraFee: setting.extraFee,
      minimumOrderAmount: setting.minimumOrderAmount ?? undefined,
      maximumOrderAmount: setting.maximumOrderAmount ?? undefined,
      allowedShippingMethodTypes: setting.allowedShippingMethodTypes as PaymentMethodFormValues["allowedShippingMethodTypes"],
      allowedZoneIds: setting.allowedZoneIds,
    },
  })
  const selectedShippingMethodTypes = useWatch({
    control: form.control,
    name: "allowedShippingMethodTypes",
  })
  const selectedZoneIds = useWatch({
    control: form.control,
    name: "allowedZoneIds",
  })

  const title = PAYMENT_GATEWAY_LABELS[setting.gateway]

  return (
    <form
      className="space-y-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4"
      onSubmit={form.handleSubmit((values) => {
        setMessage(null)
        startTransition(async () => {
          const result = await upsertPaymentMethodSettingAction(values)
          setMessage(result.success ? result.message ?? null : result.error)
          router.refresh()
        })
      })}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="admin-kicker">{title}</p>
          <h3 className="mt-1 text-sm font-semibold text-[var(--admin-foreground)]">Gateway settings</h3>
        </div>
        <label className="flex items-center gap-2 text-[0.8rem] text-[var(--admin-foreground)]">
          <input type="checkbox" {...form.register("isEnabled")} className="h-4 w-4 rounded border-[var(--admin-border)]" />
          Enabled
        </label>
      </div>

      <input type="hidden" {...form.register("gateway")} />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="admin-label">Display name</label>
          <Input {...form.register("displayName")} />
          <FieldError message={form.formState.errors.displayName?.message} />
        </div>
        <div>
          <label className="admin-label">Mode</label>
          <Select {...form.register("mode")}>
            <option value="SANDBOX">Sandbox</option>
            <option value="LIVE">Live</option>
          </Select>
          <FieldError message={form.formState.errors.mode?.message} />
        </div>
        <div>
          <label className="admin-label">
            {setting.gateway === "STRIPE" ? "Publishable key / client key" : "Client ID"}
          </label>
          <Input {...form.register("publicKey")} />
          <FieldError message={form.formState.errors.publicKey?.message} />
        </div>
        <div>
          <label className="admin-label">Secret key</label>
          <Input {...form.register("secretKey")} />
          <FieldError message={form.formState.errors.secretKey?.message} />
        </div>
        {setting.gateway === "STRIPE" ? (
          <div className="md:col-span-2">
            <label className="admin-label">Webhook secret</label>
            <Input {...form.register("webhookSecret")} />
            <FieldError message={form.formState.errors.webhookSecret?.message} />
          </div>
        ) : null}
        <div className="md:col-span-2">
          <label className="admin-label">Instructions shown at checkout</label>
          <Textarea {...form.register("instructions")} className="min-h-20" />
          <FieldError message={form.formState.errors.instructions?.message} />
        </div>
        <div>
          <label className="admin-label">Extra fee</label>
          <Input type="number" step="0.01" {...form.register("extraFee", { valueAsNumber: true })} />
          <FieldError message={form.formState.errors.extraFee?.message} />
        </div>
        <div>
          <label className="admin-label">Minimum order amount</label>
          <Input type="number" step="0.01" {...form.register("minimumOrderAmount", { valueAsNumber: true })} />
          <FieldError message={form.formState.errors.minimumOrderAmount?.message} />
        </div>
        <div>
          <label className="admin-label">Maximum order amount</label>
          <Input type="number" step="0.01" {...form.register("maximumOrderAmount", { valueAsNumber: true })} />
          <FieldError message={form.formState.errors.maximumOrderAmount?.message} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="admin-label">Allowed shipping method types</p>
          <div className="mt-2 space-y-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3">
            {Object.entries(SHIPPING_METHOD_LABELS).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 text-[0.78rem] text-[var(--admin-foreground)]">
                <input
                  type="checkbox"
                  checked={selectedShippingMethodTypes?.includes(value as PaymentMethodFormValues["allowedShippingMethodTypes"][number]) ?? false}
                  onChange={(event) => {
                    const nextValues = new Set(selectedShippingMethodTypes ?? [])
                    if (event.target.checked) {
                      nextValues.add(value as PaymentMethodFormValues["allowedShippingMethodTypes"][number])
                    } else {
                      nextValues.delete(value as PaymentMethodFormValues["allowedShippingMethodTypes"][number])
                    }
                    form.setValue(
                      "allowedShippingMethodTypes",
                      Array.from(nextValues) as PaymentMethodFormValues["allowedShippingMethodTypes"],
                      { shouldDirty: true },
                    )
                  }}
                  className="h-4 w-4 rounded border-[var(--admin-border)]"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="admin-label">Allowed zones</p>
          <div className="mt-2 space-y-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3">
            {zones.length ? (
              zones.map((zone) => (
                <label key={zone.id} className="flex items-center gap-2 text-[0.78rem] text-[var(--admin-foreground)]">
                  <input
                    type="checkbox"
                    checked={selectedZoneIds?.includes(zone.id) ?? false}
                    onChange={(event) => {
                      const nextValues = new Set(selectedZoneIds ?? [])
                      if (event.target.checked) {
                        nextValues.add(zone.id)
                      } else {
                        nextValues.delete(zone.id)
                      }
                      form.setValue("allowedZoneIds", Array.from(nextValues), {
                        shouldDirty: true,
                      })
                    }}
                    className="h-4 w-4 rounded border-[var(--admin-border)]"
                  />
                  {zone.name}
                </label>
              ))
            ) : (
              <p className="text-[0.76rem] text-[var(--admin-muted-foreground)]">
                Create shipping zones first to limit this gateway by area.
              </p>
            )}
          </div>
        </div>
      </div>

      {message ? (
        <p className="rounded-xl bg-[var(--admin-surface)] px-3 py-2 text-[0.76rem] text-[var(--admin-muted-foreground)]">
          {message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving gateway..." : `Save ${title}`}
      </Button>
    </form>
  )
}


