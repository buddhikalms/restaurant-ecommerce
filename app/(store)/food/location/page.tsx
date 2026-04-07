import { FoodLocationForm } from "@/components/cloud-kitchen/food-location-form";
import { getCloudKitchenMapsConfig } from "@/lib/cloud-kitchen/config";
import { CLOUD_KITCHEN_SERVICE_DEFAULTS } from "@/lib/cloud-kitchen/defaults";
import { getFoodLocationSession } from "@/lib/cloud-kitchen/location-session";
import { getKitchenDeliveryCoverage } from "@/lib/data/cloud-kitchen";

export default async function FoodLocationPage() {
  const [mapsConfig, selection, kitchens] = await Promise.all([
    Promise.resolve(getCloudKitchenMapsConfig()),
    getFoodLocationSession(),
    getKitchenDeliveryCoverage(),
  ]);

  const pickupKitchen = kitchens[0] ?? null;

  return (
    <div className="space-y-6">
      <section className="surface-card rounded-2xl p-5">
        <p className="section-label">Step 1</p>
        <h1 className="section-title mt-2">Choose delivery or pickup</h1>
        <p className="section-copy mt-2">
          Select delivery if you want us to validate your address inside the {CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryRadiusMiles}-mile service area, or choose pickup to collect directly from the kitchen.
        </p>
        {selection ? (
          <p className="mt-4 text-[0.82rem] text-[var(--muted-foreground)]">
            Current selection: {selection.fulfillmentType === "PICKUP" ? "Pickup" : "Delivery"} from {selection.kitchenName}.
          </p>
        ) : null}
      </section>

      <FoodLocationForm
        mapsConfig={mapsConfig}
        pickupKitchen={pickupKitchen}
        initialMode={selection?.fulfillmentType ?? "DELIVERY"}
      />
    </div>
  );
}