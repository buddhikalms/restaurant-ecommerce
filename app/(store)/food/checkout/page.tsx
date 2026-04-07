import { redirect } from "next/navigation";

import { FoodCheckoutForm } from "@/components/cloud-kitchen/food-checkout-form";
import { FoodLocationSummary } from "@/components/cloud-kitchen/food-location-summary";
import { requireRetailUser } from "@/lib/auth-helpers";
import { getFoodLocationSession } from "@/lib/cloud-kitchen/location-session";
import { resolveDeliveryEligibility } from "@/lib/cloud-kitchen/service";
import {
  getCustomerDeliveryAddresses,
  getKitchenDeliveryCoverage,
} from "@/lib/data/cloud-kitchen";

export default async function FoodCheckoutPage() {
  const user = await requireRetailUser();
  const selection = await getFoodLocationSession();

  if (!selection) {
    redirect("/food/location");
  }

  const [savedAddresses, kitchens] = await Promise.all([
    getCustomerDeliveryAddresses(user.id),
    getKitchenDeliveryCoverage(),
  ]);

  const kitchen = kitchens.find((entry) => entry.id === selection.kitchenId);

  if (!kitchen) {
    redirect("/food/location");
  }

  if (selection.fulfillmentType === "PICKUP") {
    const pickupAddress = {
      label: "Pickup",
      recipientName: user.name ?? "",
      phone: "",
      line1: kitchen.addressLine1,
      line2: kitchen.addressLine2,
      city: kitchen.city,
      state: kitchen.state,
      postalCode: kitchen.postalCode,
      country: kitchen.country,
      formattedAddress: [
        kitchen.addressLine1,
        kitchen.addressLine2,
        kitchen.city,
        kitchen.state,
        kitchen.postalCode,
        kitchen.country,
      ]
        .filter(Boolean)
        .join(", "),
      placeId: null,
      latitude: kitchen.latitude,
      longitude: kitchen.longitude,
      deliveryInstructions: null,
    };

    return (
      <div className="space-y-6">
        <FoodLocationSummary selection={selection} />

        <section className="surface-card rounded-2xl p-5">
          <p className="section-label">Step 4</p>
          <h1 className="section-title mt-2">Checkout and place your pickup order</h1>
          <p className="section-copy mt-2">
            Pickup orders are sent directly to the kitchen without delivery validation or delivery fees.
          </p>
        </section>

        <FoodCheckoutForm
          kitchenId={selection.kitchenId}
          kitchenName={selection.kitchenName}
          preview={{
            fulfillmentType: "PICKUP",
            kitchenId: kitchen.id,
            kitchenName: kitchen.name,
            deliveryZoneName: null,
            distanceKm: null,
            deliveryFee: 0,
            minimumOrderAmount: 0,
            freeDeliveryMinimum: null,
          }}
          address={pickupAddress}
        />
      </div>
    );
  }

  const preview = await resolveDeliveryEligibility({
    location: {
      latitude: selection.address.latitude,
      longitude: selection.address.longitude,
    },
    subtotal: 0,
  });

  if (!preview.eligible || preview.kitchen.id !== selection.kitchenId) {
    redirect("/food/location");
  }

  const matchingSavedAddress = savedAddresses.find(
    (address: (typeof savedAddresses)[number]) =>
      (selection.address.placeId && address.placeId === selection.address.placeId) ||
      address.formattedAddress === selection.address.formattedAddress,
  );

  const checkoutAddress = {
    label: matchingSavedAddress?.label ?? selection.address.label ?? "Home",
    recipientName: matchingSavedAddress?.recipientName ?? user.name ?? "",
    phone: matchingSavedAddress?.phone ?? "",
    line1: selection.address.line1,
    line2: selection.address.line2,
    city: selection.address.city,
    state: selection.address.state,
    postalCode: selection.address.postalCode,
    country: selection.address.country,
    formattedAddress: selection.address.formattedAddress,
    placeId: selection.address.placeId,
    latitude: selection.address.latitude,
    longitude: selection.address.longitude,
    deliveryInstructions:
      matchingSavedAddress?.deliveryInstructions ?? selection.address.deliveryInstructions,
  };

  return (
    <div className="space-y-6">
      <FoodLocationSummary selection={selection} />

      <section className="surface-card rounded-2xl p-5">
        <p className="section-label">Step 4</p>
        <h1 className="section-title mt-2">Checkout and place your order</h1>
        <p className="section-copy mt-2">
          We re-check delivery eligibility on the server before creating the food order.
        </p>
      </section>

      <FoodCheckoutForm
        kitchenId={selection.kitchenId}
        kitchenName={selection.kitchenName}
        preview={{
          fulfillmentType: "DELIVERY",
          kitchenId: preview.kitchen.id,
          kitchenName: preview.kitchen.name,
          deliveryZoneName: preview.deliveryZone?.name ?? null,
          distanceKm: preview.distanceKm,
          deliveryFee: preview.deliveryFee,
          minimumOrderAmount: preview.minimumOrderAmount,
          freeDeliveryMinimum: preview.freeDeliveryMinimum,
        }}
        address={checkoutAddress}
      />
    </div>
  );
}
