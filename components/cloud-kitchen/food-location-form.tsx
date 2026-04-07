"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  selectPickupKitchenAction,
  validateDeliveryEligibilityAction,
} from "@/lib/actions/cloud-kitchen-actions";
import { CLOUD_KITCHEN_SERVICE_DEFAULTS } from "@/lib/cloud-kitchen/defaults";
import { foodLocationSchema } from "@/lib/validations/cloud-kitchen";

type FoodLocationFormInput = z.input<typeof foodLocationSchema>;
type FoodLocationFormValues = z.output<typeof foodLocationSchema>;

type MapsConfig = {
  apiKey: string | null;
  mapId: string | null;
  defaultCenter: {
    latitude: number;
    longitude: number;
  };
  defaultZoom: number;
};

type PickupKitchen = {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  minimumOrderAmount: number;
  preparationTimeMins: number;
};

type GoogleMapsPlace = {
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address?: string;
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
  place_id?: string;
};

function getMapsWindow() {
  return window as Window & {
    google?: any;
    __foodGoogleMapsLoader?: Promise<void>;
  };
}

function getAddressComponent(place: GoogleMapsPlace, types: string[]) {
  const component = place.address_components?.find((entry) =>
    types.some((type) => entry.types.includes(type)),
  );

  return component?.long_name ?? "";
}

function getStreetAddress(place: GoogleMapsPlace) {
  const streetNumber = getAddressComponent(place, ["street_number"]);
  const route = getAddressComponent(place, ["route"]);
  return [streetNumber, route].filter(Boolean).join(" ").trim();
}

async function loadGoogleMapsScript(apiKey: string) {
  const googleWindow = getMapsWindow();

  if (googleWindow.google?.maps?.places?.Autocomplete) {
    return;
  }

  if (!googleWindow.__foodGoogleMapsLoader) {
    googleWindow.__foodGoogleMapsLoader = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google Maps."));
      document.head.appendChild(script);
    });
  }

  return googleWindow.__foodGoogleMapsLoader;
}

export function FoodLocationForm({
  mapsConfig,
  pickupKitchen,
  initialMode,
}: {
  mapsConfig: MapsConfig;
  pickupKitchen: PickupKitchen | null;
  initialMode: "DELIVERY" | "PICKUP";
}) {
  const router = useRouter();
  const line1InputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<"DELIVERY" | "PICKUP">(initialMode);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FoodLocationFormInput, unknown, FoodLocationFormValues>({
    resolver: zodResolver(foodLocationSchema),
    defaultValues: {
      label: "Home",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Sri Lanka",
      formattedAddress: "",
      placeId: "",
      latitude: mapsConfig.defaultCenter.latitude,
      longitude: mapsConfig.defaultCenter.longitude,
      deliveryInstructions: "",
    },
  });

  useEffect(() => {
    if (mode !== "DELIVERY" || !mapsConfig.apiKey || !mapRef.current || !line1InputRef.current) {
      return;
    }

    let isMounted = true;
    let map: any = null;
    let marker: any = null;

    loadGoogleMapsScript(mapsConfig.apiKey)
      .then(() => {
        const googleWindow = getMapsWindow();

        if (
          !isMounted ||
          !mapRef.current ||
          !line1InputRef.current ||
          !googleWindow.google?.maps?.Map ||
          !googleWindow.google?.maps?.Marker ||
          !googleWindow.google?.maps?.places?.Autocomplete
        ) {
          return;
        }

        map = new googleWindow.google.maps.Map(mapRef.current, {
          center: {
            lat: mapsConfig.defaultCenter.latitude,
            lng: mapsConfig.defaultCenter.longitude,
          },
          zoom: mapsConfig.defaultZoom,
          mapId: mapsConfig.mapId ?? undefined,
        });

        marker = new googleWindow.google.maps.Marker({
          map,
          draggable: true,
          position: {
            lat: mapsConfig.defaultCenter.latitude,
            lng: mapsConfig.defaultCenter.longitude,
          },
        });

        marker.addListener("dragend", () => {
          const position = marker.getPosition();

          if (!position) {
            return;
          }

          setValue("latitude", position.lat(), { shouldDirty: true, shouldTouch: true });
          setValue("longitude", position.lng(), { shouldDirty: true, shouldTouch: true });
        });

        const autocomplete = new googleWindow.google.maps.places.Autocomplete(line1InputRef.current, {
          fields: ["address_components", "formatted_address", "geometry", "place_id"],
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace() as GoogleMapsPlace;
          const latitude = place.geometry?.location?.lat();
          const longitude = place.geometry?.location?.lng();

          setValue("line1", getStreetAddress(place) || getValues("line1"), {
            shouldDirty: true,
            shouldTouch: true,
          });
          setValue(
            "city",
            getAddressComponent(place, ["locality", "postal_town", "sublocality"]),
            { shouldDirty: true, shouldTouch: true },
          );
          setValue("state", getAddressComponent(place, ["administrative_area_level_1"]), {
            shouldDirty: true,
            shouldTouch: true,
          });
          setValue("postalCode", getAddressComponent(place, ["postal_code"]), {
            shouldDirty: true,
            shouldTouch: true,
          });
          setValue("country", getAddressComponent(place, ["country"]), {
            shouldDirty: true,
            shouldTouch: true,
          });
          setValue("formattedAddress", place.formatted_address ?? "", {
            shouldDirty: true,
            shouldTouch: true,
          });
          setValue("placeId", place.place_id ?? "", { shouldDirty: true });

          if (typeof latitude === "number" && typeof longitude === "number") {
            setValue("latitude", latitude, { shouldDirty: true, shouldTouch: true });
            setValue("longitude", longitude, { shouldDirty: true, shouldTouch: true });
            map?.setCenter({ lat: latitude, lng: longitude });
            map?.setZoom(15);
            marker?.setPosition({ lat: latitude, lng: longitude });
          }
        });
      })
      .catch(() => {
        setStatusMessage(
          "Google Maps could not be loaded. You can still enter the address manually and provide coordinates.",
        );
      });

    return () => {
      isMounted = false;
    };
  }, [getValues, mapsConfig.apiKey, mapsConfig.defaultCenter.latitude, mapsConfig.defaultCenter.longitude, mapsConfig.defaultZoom, mapsConfig.mapId, mode, setValue]);

  const line1Registration = register("line1");
  const pickupAddress = pickupKitchen
    ? [
        pickupKitchen.addressLine1,
        pickupKitchen.addressLine2,
        pickupKitchen.city,
        pickupKitchen.state,
        pickupKitchen.postalCode,
        pickupKitchen.country,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className={`rounded-2xl border p-4 text-left transition ${mode === "DELIVERY" ? "border-[var(--brand)] bg-[var(--surface-muted)]" : "border-[var(--border)] bg-[var(--surface)]"}`}
          onClick={() => setMode("DELIVERY")}
        >
          <p className="section-label">Delivery</p>
          <h2 className="mt-2 text-lg font-semibold text-[var(--foreground)]">Send my order out</h2>
          <p className="mt-2 text-[0.82rem] leading-6 text-[var(--muted-foreground)]">
            Validate the address first, then we will confirm the delivery fee, zone, and ETA.
          </p>
        </button>
        <button
          type="button"
          className={`rounded-2xl border p-4 text-left transition ${mode === "PICKUP" ? "border-[var(--brand)] bg-[var(--surface-muted)]" : "border-[var(--border)] bg-[var(--surface)]"}`}
          onClick={() => setMode("PICKUP")}
        >
          <p className="section-label">Pickup</p>
          <h2 className="mt-2 text-lg font-semibold text-[var(--foreground)]">Collect from the kitchen</h2>
          <p className="mt-2 text-[0.82rem] leading-6 text-[var(--muted-foreground)]">
            Skip delivery checks and place the order for collection directly from the kitchen.
          </p>
        </button>
      </div>

      {mode === "PICKUP" ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]">
          <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div>
              <p className="section-label">Pickup point</p>
              <h2 className="section-subtitle mt-2">Collect your order from the kitchen</h2>
              <p className="section-copy mt-2">
                Pickup orders skip the delivery fee and can be collected once the kitchen confirms the order.
              </p>
            </div>
            {pickupKitchen ? (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-[0.82rem] text-[var(--muted-foreground)]">
                <p className="font-medium text-[var(--foreground)]">{pickupKitchen.name}</p>
                <p className="mt-2">{pickupAddress}</p>
                <p className="mt-2">Typical prep time: {pickupKitchen.preparationTimeMins} minutes</p>
              </div>
            ) : (
              <p className="text-[0.82rem] text-[var(--danger)]">No pickup kitchen is available right now.</p>
            )}
            {resultMessage ? (
              <p className="rounded-xl bg-[var(--surface-muted)] px-4 py-3 text-[0.8rem] text-[var(--muted-foreground)]">{resultMessage}</p>
            ) : null}
            <Button
              type="button"
              disabled={isPending || !pickupKitchen}
              onClick={() => {
                setResultMessage(null);
                startTransition(async () => {
                  const result = await selectPickupKitchenAction();
                  if (!result.success) {
                    setResultMessage(result.error ?? "Pickup is unavailable right now.");
                    return;
                  }

                  setResultMessage(result.message ?? "Pickup selected.");
                  router.push("/food/menu");
                  router.refresh();
                });
              }}
            >
              {isPending ? "Selecting pickup..." : "Choose pickup"}
            </Button>
          </div>

          <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div>
              <p className="section-label">Why pickup</p>
              <h2 className="section-subtitle mt-2">Fast and fee-free</h2>
              <p className="section-copy mt-2">
                Pickup works well when you are nearby and want to avoid the delivery fee or service radius checks.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-[0.82rem] text-[var(--muted-foreground)]">
              <p>Delivery fee saved: £{CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryFee}</p>
              <p className="mt-2">Pickup usually takes {CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryTimeMinMins} to {CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryTimeMaxMins} minutes depending on kitchen load.</p>
            </div>
          </div>
        </div>
      ) : (
        <form
          className="space-y-5"
          onSubmit={handleSubmit((values) => {
            setResultMessage(null);
            startTransition(async () => {
              const formattedAddress =
                values.formattedAddress ||
                [values.line1, values.line2, values.city, values.state, values.postalCode, values.country]
                  .filter(Boolean)
                  .join(", ");

              const result = await validateDeliveryEligibilityAction({
                ...values,
                formattedAddress,
              });

              if (!result.success) {
                setResultMessage(result.error);
                return;
              }

              setResultMessage(result.data?.message ?? "Delivery available.");
              router.push("/food/menu");
              router.refresh();
            });
          })}
        >
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]">
            <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div>
                <p className="section-label">Delivery address</p>
                <h2 className="section-subtitle mt-2">Choose where your meal should arrive</h2>
                <p className="section-copy mt-2">Start with Google autocomplete, then fine-tune the map pin if needed. We use it to confirm you are inside the {CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryRadiusMiles}-mile delivery radius.</p>
              </div>

              <div>
                <label className="field-label">Address label</label>
                <Input {...register("label")} placeholder="Home, Office, Apartment" />
                <FieldError message={errors.label?.message} />
              </div>

              <div>
                <label className="field-label">Address line 1</label>
                <Input
                  {...line1Registration}
                  ref={(element) => {
                    line1Registration.ref(element);
                    line1InputRef.current = element;
                  }}
                  placeholder={mapsConfig.apiKey ? "Search your address" : "Enter address line 1"}
                />
                <FieldError message={errors.line1?.message} />
              </div>

              <div>
                <label className="field-label">Address line 2</label>
                <Input {...register("line2")} placeholder="Apartment, suite, landmark" />
                <FieldError message={errors.line2?.message} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label">City</label>
                  <Input {...register("city")} />
                  <FieldError message={errors.city?.message} />
                </div>
                <div>
                  <label className="field-label">State / Province</label>
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
              </div>

              <div>
                <label className="field-label">Delivery instructions</label>
                <Textarea {...register("deliveryInstructions")} placeholder="Gate code, apartment floor, landmark, or rider notes" />
                <FieldError message={errors.deliveryInstructions?.message} />
              </div>

              <input type="hidden" {...register("formattedAddress")} />
              <input type="hidden" {...register("placeId")} />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label">Latitude</label>
                  <Input type="number" step="0.0000001" {...register("latitude", { valueAsNumber: true })} />
                  <FieldError message={errors.latitude?.message} />
                </div>
                <div>
                  <label className="field-label">Longitude</label>
                  <Input type="number" step="0.0000001" {...register("longitude", { valueAsNumber: true })} />
                  <FieldError message={errors.longitude?.message} />
                </div>
              </div>

              {resultMessage ? (
                <p className="rounded-xl bg-[var(--surface-muted)] px-4 py-3 text-[0.8rem] text-[var(--muted-foreground)]">{resultMessage}</p>
              ) : null}

              <Button type="submit" disabled={isPending}>
                {isPending ? "Checking delivery..." : "Check delivery availability"}
              </Button>
            </div>

            <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div>
                <p className="section-label">Map selection</p>
                <h2 className="section-subtitle mt-2">Confirm the delivery point</h2>
                <p className="section-copy mt-2">Drag the marker if the autocomplete result needs a small adjustment before we check the delivery fee and timing.</p>
              </div>
              <div ref={mapRef} className="h-[360px] rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,rgba(157,112,57,0.1),rgba(39,63,49,0.08))]" />
              <p className="text-[0.78rem] leading-6 text-[var(--muted-foreground)]">
                {statusMessage ??
                  (mapsConfig.apiKey
                    ? "Autocomplete and the map use your Google Maps browser key."
                    : "Add a Google Maps browser key to enable autocomplete and the map widget.")}
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}