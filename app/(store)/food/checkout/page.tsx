import { redirect } from "next/navigation";

import { FoodCheckoutForm } from "@/components/cloud-kitchen/food-checkout-form";
import { FoodLocationSummary } from "@/components/cloud-kitchen/food-location-summary";
import { requireRetailUser } from "@/lib/auth-helpers";
import { getFoodLocationSession } from "@/lib/cloud-kitchen/location-session";
import { resolveDeliveryEligibility } from "@/lib/cloud-kitchen/service";
import { getCustomerDeliveryAddresses } from "@/lib/data/cloud-kitchen";

export default async function FoodCheckoutPage() {
  const user = await requireRetailUser();
  const selection = await getFoodLocationSession();

  if (!selection) {
    redirect("/food/location");
  }

  const [savedAddresses, preview] = await Promise.all([
    getCustomerDeliveryAddresses(user.id),
    resolveDeliveryEligibility({
      location: {
        latitude: selection.address.latitude,
        longitude: selection.address.longitude,
      },
      subtotal: 0,
    }),
  ]);

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

