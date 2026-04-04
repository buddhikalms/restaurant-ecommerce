"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { useCart } from "@/components/providers/cart-provider"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field-error"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  getCheckoutPreviewAction,
  submitCheckoutAction,
} from "@/lib/actions/order-actions"
import { type PricingMode } from "@/lib/user-roles"
import { formatCurrency } from "@/lib/utils"
import {
  checkoutQuoteSchema,
  wholesaleCheckoutQuoteSchema,
} from "@/lib/validations/checkout"

type MapsConfig = {
  enabled: boolean
  apiKey?: string | null
}

type GoogleMapsPlace = {
  address_components?: Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
  geometry?: {
    location?: {
      lat: () => number
      lng: () => number
    }
  }
  place_id?: string
}

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: Record<string, unknown>,
          ) => {
            addListener: (eventName: string, listener: () => void) => void
            getPlace: () => GoogleMapsPlace
          }
        }
      }
    }
    __googleMapsLoader?: Promise<void>
  }
}

const retailCheckoutFormSchema = checkoutQuoteSchema
const wholesaleCheckoutFormSchema = wholesaleCheckoutQuoteSchema

type CheckoutFormValues = z.infer<typeof retailCheckoutFormSchema>

type PreviewActionResult = Awaited<ReturnType<typeof getCheckoutPreviewAction>>
type CheckoutQuoteData = NonNullable<Extract<PreviewActionResult, { success: true }>["data"]>

function getAddressComponent(place: GoogleMapsPlace, types: string[]) {
  const component = place.address_components?.find((entry) =>
    types.some((type) => entry.types.includes(type)),
  )

  return component?.long_name ?? ""
}

function getStreetAddress(place: GoogleMapsPlace) {
  const streetNumber = getAddressComponent(place, ["street_number"])
  const route = getAddressComponent(place, ["route"])
  return [streetNumber, route].filter(Boolean).join(" ").trim()
}

async function loadGoogleMapsScript(apiKey: string) {
  if (window.google?.maps?.places?.Autocomplete) {
    return
  }

  if (!window.__googleMapsLoader) {
    window.__googleMapsLoader = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load Google Maps."))
      document.head.appendChild(script)
    })
  }

  return window.__googleMapsLoader
}

export function CheckoutForm({
  customerDefaults,
  pricingMode,
  accountBasePath,
  mapsConfig,
}: {
  customerDefaults: {
    name?: string | null
    email?: string | null
    phone?: string | null
    businessName?: string | null
    line1?: string | null
    line2?: string | null
    city?: string | null
    state?: string | null
    postalCode?: string | null
    country?: string | null
    latitude?: number | null
    longitude?: number | null
    placeId?: string | null
  }
  pricingMode: PricingMode
  accountBasePath: string
  mapsConfig?: MapsConfig
}) {
  const router = useRouter()
  const line1InputRef = useRef<HTMLInputElement | null>(null)
  const { items, subtotal, clearCart } = useCart()
  const [message, setMessage] = useState<string | null>(null)
  const [quote, setQuote] = useState<CheckoutQuoteData | null>(null)
  const [quoteMessage, setQuoteMessage] = useState<string | null>(null)
  const [isPreviewPending, startPreviewTransition] = useTransition()
  const [isSubmitPending, startSubmitTransition] = useTransition()
  const formSchema =
    pricingMode === "wholesale"
      ? wholesaleCheckoutFormSchema
      : retailCheckoutFormSchema
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: customerDefaults.name ?? "",
      businessName: customerDefaults.businessName ?? "",
      email: customerDefaults.email ?? "",
      phone: customerDefaults.phone ?? "",
      line1: customerDefaults.line1 ?? "",
      line2: customerDefaults.line2 ?? "",
      city: customerDefaults.city ?? "",
      state: customerDefaults.state ?? "",
      postalCode: customerDefaults.postalCode ?? "",
      country: customerDefaults.country ?? "USA",
      latitude: customerDefaults.latitude ?? null,
      longitude: customerDefaults.longitude ?? null,
      placeId: customerDefaults.placeId ?? "",
      notes: "",
      selectedShippingMethodId: undefined,
      paymentGateway: undefined,
      items: [],
    },
  })

  const [
    customerName,
    businessName,
    email,
    phone,
    line1,
    line2,
    city,
    state,
    postalCode,
    country,
    latitude,
    longitude,
    placeId,
    notes,
    selectedShippingMethodId,
    paymentGateway,
  ] = useWatch({
    control,
    name: [
      "customerName",
      "businessName",
      "email",
      "phone",
      "line1",
      "line2",
      "city",
      "state",
      "postalCode",
      "country",
      "latitude",
      "longitude",
      "placeId",
      "notes",
      "selectedShippingMethodId",
      "paymentGateway",
    ],
  })

  const itemPayload = useMemo(
    () =>
      items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    [items],
  )
  const quoteInput = useMemo(() => {
    const hasRequiredAddress = [
      customerName,
      email,
      phone,
      line1,
      city,
      state,
      postalCode,
      country,
    ].every((value) => Boolean(String(value ?? "").trim()))

    if (!hasRequiredAddress || !itemPayload.length) {
      return null
    }

    return {
      customerName: customerName ?? "",
      businessName,
      email: email ?? "",
      phone: phone ?? "",
      line1: line1 ?? "",
      line2,
      city: city ?? "",
      state: state ?? "",
      postalCode: postalCode ?? "",
      country: country ?? "",
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      placeId,
      notes,
      items: itemPayload,
      selectedShippingMethodId,
      paymentGateway,
    }
  }, [
    businessName,
    city,
    country,
    customerName,
    email,
    itemPayload,
    latitude,
    line1,
    line2,
    longitude,
    notes,
    paymentGateway,
    phone,
    placeId,
    postalCode,
    selectedShippingMethodId,
    state,
  ])

  useEffect(() => {
    if (!mapsConfig?.enabled || !mapsConfig.apiKey || !line1InputRef.current) {
      return
    }

    let isMounted = true

    loadGoogleMapsScript(mapsConfig.apiKey)
      .then(() => {
        if (!isMounted || !line1InputRef.current || !window.google?.maps?.places?.Autocomplete) {
          return
        }

        const autocomplete = new window.google.maps.places.Autocomplete(
          line1InputRef.current,
          {
            fields: ["address_components", "geometry", "place_id"],
          },
        )

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace()
          const streetAddress = getStreetAddress(place)

          if (streetAddress) {
            setValue("line1", streetAddress, { shouldDirty: true, shouldTouch: true })
          }

          setValue(
            "city",
            getAddressComponent(place, ["locality", "postal_town", "sublocality"]),
            { shouldDirty: true, shouldTouch: true },
          )
          setValue(
            "state",
            getAddressComponent(place, ["administrative_area_level_1"]),
            { shouldDirty: true, shouldTouch: true },
          )
          setValue("postalCode", getAddressComponent(place, ["postal_code"]), {
            shouldDirty: true,
            shouldTouch: true,
          })
          setValue("country", getAddressComponent(place, ["country"]), {
            shouldDirty: true,
            shouldTouch: true,
          })
          setValue("latitude", place.geometry?.location?.lat() ?? null, {
            shouldDirty: true,
          })
          setValue("longitude", place.geometry?.location?.lng() ?? null, {
            shouldDirty: true,
          })
          setValue("placeId", place.place_id ?? "", { shouldDirty: true })
        })
      })
      .catch(() => {
        setQuoteMessage("Google Maps autocomplete could not be loaded. You can still enter the address manually.")
      })

    return () => {
      isMounted = false
    }
  }, [mapsConfig?.apiKey, mapsConfig?.enabled, setValue])

  useEffect(() => {
    if (!quoteInput) {
      setQuote(null)
      setQuoteMessage(items.length ? "Enter your delivery address to see delivery and payment options." : "Your cart is empty.")
      return
    }

    const timer = window.setTimeout(() => {
      startPreviewTransition(async () => {
        const result = await getCheckoutPreviewAction(quoteInput)

        if (!result.success) {
          setQuote(null)
          setQuoteMessage(result.error)
          return
        }

        if (!result.data) {
          setQuote(null)
          setQuoteMessage("We could not calculate checkout options.")
          return
        }

        setQuote(result.data)
        setQuoteMessage(
          result.data.shippingMethods.length
            ? null
            : "No delivery options are currently available for this address.",
        )

        if (
          result.data.selectedShippingMethodId &&
          result.data.selectedShippingMethodId !== selectedShippingMethodId
        ) {
          setValue("selectedShippingMethodId", result.data.selectedShippingMethodId, {
            shouldDirty: true,
          })
        }

        if (
          result.data.selectedPaymentGateway &&
          result.data.selectedPaymentGateway !== paymentGateway
        ) {
          setValue("paymentGateway", result.data.selectedPaymentGateway, {
            shouldDirty: true,
          })
        }
      })
    }, 350)

    return () => window.clearTimeout(timer)
  }, [
    items.length,
    paymentGateway,
    quoteInput,
    selectedShippingMethodId,
    setValue,
    startPreviewTransition,
  ])

  const line1Registration = register("line1")

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <form
        className="surface-card rounded-lg p-5"
        onSubmit={handleSubmit((values) => {
          if (!items.length) {
            setMessage("Your cart is empty.")
            return
          }

          setMessage(null)
          startSubmitTransition(async () => {
            const resolvedShippingMethodId =
              values.selectedShippingMethodId ?? quote?.selectedShippingMethodId ?? ""
            const resolvedPaymentGateway =
              values.paymentGateway ?? quote?.selectedPaymentGateway ?? null

            if (!resolvedShippingMethodId) {
              setMessage("Choose a delivery option before placing the order.")
              return
            }

            if (!resolvedPaymentGateway) {
              setMessage("Choose a payment method before placing the order.")
              return
            }

            const result = await submitCheckoutAction({
              ...values,
              items: itemPayload,
              selectedShippingMethodId: resolvedShippingMethodId,
              paymentGateway: resolvedPaymentGateway,
            })

            if (!result.success) {
              setMessage(result.error)
              return
            }

            if (!result.data) {
              setMessage("Checkout completed, but no response data was returned.")
              return
            }

            if (result.data.kind === "redirect") {
              window.location.href = result.data.redirectUrl
              return
            }

            clearCart()
            router.push(`${accountBasePath}/orders/${result.data.orderId}?placed=1`)
            router.refresh()
          })
        })}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="field-label">Customer name</label>
            <Input {...register("customerName")} />
            <FieldError message={errors.customerName?.message} />
          </div>
          {pricingMode === "wholesale" ? (
            <div>
              <label className="field-label">Business name</label>
              <Input {...register("businessName")} />
              <FieldError message={errors.businessName?.message} />
            </div>
          ) : null}
          <div>
            <label className="field-label">Email</label>
            <Input type="email" {...register("email")} />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <label className="field-label">Phone</label>
            <Input {...register("phone")} />
            <FieldError message={errors.phone?.message} />
          </div>
          <div className="md:col-span-2">
            <label className="field-label">Address line 1</label>
            <Input
              {...line1Registration}
              ref={(element) => {
                line1Registration.ref(element)
                line1InputRef.current = element
              }}
              placeholder={
                mapsConfig?.enabled && mapsConfig.apiKey
                  ? "Start typing and select an address"
                  : undefined
              }
            />
            <FieldError message={errors.line1?.message} />
          </div>
          <div className="md:col-span-2">
            <label className="field-label">Address line 2</label>
            <Input {...register("line2")} />
          </div>
          <div>
            <label className="field-label">City</label>
            <Input {...register("city")} />
            <FieldError message={errors.city?.message} />
          </div>
          <div>
            <label className="field-label">State</label>
            <Input {...register("state")} />
            <FieldError message={errors.state?.message} />
          </div>
          <div>
            <label className="field-label">Postal code</label>
            <Input {...register("postalCode")} />
            <FieldError message={errors.postalCode?.message} />
          </div>
          <div>
            <label className="field-label">Country</label>
            <Input {...register("country")} />
            <FieldError message={errors.country?.message} />
          </div>
          <input type="hidden" {...register("latitude", { valueAsNumber: true })} />
          <input type="hidden" {...register("longitude", { valueAsNumber: true })} />
          <input type="hidden" {...register("placeId")} />
          <div className="md:col-span-2">
            <label className="field-label">Delivery notes</label>
            <Textarea {...register("notes")} placeholder="Optional delivery notes" />
            <FieldError message={errors.notes?.message} />
          </div>
        </div>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-label">Delivery options</p>
              <p className="mt-1 text-[0.8rem] text-[var(--muted-foreground)]">
                Delivery and payment options refresh from server-side rules as the address changes.
              </p>
            </div>
            {isPreviewPending ? (
              <span className="text-[0.75rem] text-[var(--muted-foreground)]">Refreshing...</span>
            ) : null}
          </div>
          <div className="mt-4 space-y-3">
            {quote?.shippingMethods.length ? (
              quote.shippingMethods.map((method: CheckoutQuoteData["shippingMethods"][number]) => (
                <label
                  key={method.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3"
                >
                  <input
                    type="radio"
                    value={method.id}
                    checked={selectedShippingMethodId === method.id}
                    onChange={(event) =>
                      setValue("selectedShippingMethodId", event.target.value, {
                        shouldDirty: true,
                      })
                    }
                    className="mt-1 h-4 w-4"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {method.name}
                      </span>
                      <span className="text-sm font-semibold text-[var(--foreground)]">
                        {formatCurrency(method.cost)}
                      </span>
                    </div>
                    {method.description ? (
                      <p className="mt-1 text-[0.78rem] text-[var(--muted-foreground)]">
                        {method.description}
                      </p>
                    ) : null}
                    {method.estimatedMinDays || method.estimatedMaxDays ? (
                      <p className="mt-1 text-[0.72rem] text-[var(--muted-foreground)]">
                        Estimated delivery: {method.estimatedMinDays ?? method.estimatedMaxDays} to {method.estimatedMaxDays ?? method.estimatedMinDays} day(s)
                      </p>
                    ) : null}
                    {method.instructions ? (
                      <p className="mt-1 text-[0.72rem] text-[var(--muted-foreground)]">
                        {method.instructions}
                      </p>
                    ) : null}
                  </div>
                </label>
              ))
            ) : (
              <p className="text-[0.82rem] text-[var(--muted-foreground)]">
                {quoteMessage ?? "Enter your address to load delivery options."}
              </p>
            )}
            <FieldError message={errors.selectedShippingMethodId?.message} />
          </div>
        </section>

        <section className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <p className="section-label">Payment methods</p>
          <div className="mt-4 space-y-3">
            {quote?.paymentMethods.length ? (
              quote.paymentMethods.map((method: CheckoutQuoteData["paymentMethods"][number]) => (
                <label
                  key={method.gateway}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3"
                >
                  <input
                    type="radio"
                    value={method.gateway}
                    checked={paymentGateway === method.gateway}
                    onChange={(event) =>
                      setValue("paymentGateway", event.target.value as CheckoutFormValues["paymentGateway"], {
                        shouldDirty: true,
                      })
                    }
                    className="mt-1 h-4 w-4"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {method.displayName}
                      </span>
                      {method.fee > 0 ? (
                        <span className="text-[0.78rem] text-[var(--muted-foreground)]">
                          Fee {formatCurrency(method.fee)}
                        </span>
                      ) : null}
                    </div>
                    {method.instructions ? (
                      <p className="mt-1 text-[0.78rem] text-[var(--muted-foreground)]">
                        {method.instructions}
                      </p>
                    ) : null}
                  </div>
                </label>
              ))
            ) : (
              <p className="text-[0.82rem] text-[var(--muted-foreground)]">
                {quote?.shippingMethods.length
                  ? "No payment methods are currently available for the selected delivery option."
                  : "Select a delivery option to load payment methods."}
              </p>
            )}
            <FieldError message={errors.paymentGateway?.message} />
          </div>
        </section>

        {message ? (
          <p className="mt-4 rounded-md bg-[var(--surface-muted)] px-3 py-2 text-[0.82rem] text-[var(--danger)]">
            {message}
          </p>
        ) : null}

        <Button
          type="submit"
          className="mt-4 w-full"
          disabled={isSubmitPending || isPreviewPending || !items.length || !quote?.paymentMethods.length}
        >
          {isSubmitPending
            ? "Submitting..."
            : paymentGateway === "CASH_ON_DELIVERY"
              ? "Place cash on delivery order"
              : "Continue to payment"}
        </Button>
      </form>

      <aside className="surface-card rounded-lg p-4">
        <p className="section-label">Order summary</p>
        <div className="mt-3 space-y-2 text-[0.82rem] text-[var(--muted-foreground)]">
          {items.map((item) => (
            <div key={item.itemId} className="flex items-center justify-between gap-2">
              <span className="line-clamp-1">{item.name}</span>
              <span>{formatCurrency(item.quantity * item.unitPrice)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4 text-[0.82rem] text-[var(--muted-foreground)]">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(quote?.subtotal ?? subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span>{formatCurrency(quote?.shippingCost ?? 0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Handling</span>
            <span>{formatCurrency(quote?.handlingFee ?? 0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Payment fee</span>
            <span>{formatCurrency(quote?.paymentFee ?? 0)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-[var(--border)] pt-2 text-sm font-semibold text-[var(--foreground)]">
            <span>Total</span>
            <span>{formatCurrency(quote?.total ?? subtotal)}</span>
          </div>
          {quote?.zone ? (
            <p className="pt-2 text-[0.72rem] leading-5 text-[var(--muted-foreground)]">
              Delivery zone: {quote.zone.name}
            </p>
          ) : null}
          {quote?.deliveryNotes ? (
            <p className="text-[0.72rem] leading-5 text-[var(--muted-foreground)]">
              {quote.deliveryNotes}
            </p>
          ) : null}
          {quoteMessage ? (
            <p className="text-[0.72rem] leading-5 text-[var(--danger)]">
              {quoteMessage}
            </p>
          ) : null}
        </div>
      </aside>
    </div>
  )
}



