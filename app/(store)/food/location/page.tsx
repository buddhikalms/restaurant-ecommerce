import { FoodLocationForm } from "@/components/cloud-kitchen/food-location-form";
import { getCloudKitchenMapsConfig } from "@/lib/cloud-kitchen/config";
import { CLOUD_KITCHEN_SERVICE_DEFAULTS } from "@/lib/cloud-kitchen/defaults";
import { getFoodLocationSession } from "@/lib/cloud-kitchen/location-session";

export default async function FoodLocationPage() {
  const [mapsConfig, selection] = await Promise.all([
    Promise.resolve(getCloudKitchenMapsConfig()),
    getFoodLocationSession(),
  ]);

  return (
    <div className="space-y-6">
      <section className="surface-card rounded-2xl p-5">
        <p className="section-label">Step 1</p>
        <h1 className="section-title mt-2">Select your delivery location</h1>
        <p className="section-copy mt-2">
          We validate addresses within {CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryRadiusMiles} miles before the menu opens.
          Delivery is £{CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryFee} and usually arrives in {" "}
          {CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryTimeMinMins} to {" "}
          {CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryTimeMaxMins} minutes.
        </p>
        {selection ? (
          <p className="mt-4 text-[0.82rem] text-[var(--muted-foreground)]">
            Current selection: {selection.address.formattedAddress} served by {selection.kitchenName}.
          </p>
        ) : null}
      </section>

      <FoodLocationForm mapsConfig={mapsConfig} />
    </div>
  );
}

