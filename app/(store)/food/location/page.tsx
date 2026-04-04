import { FoodLocationForm } from "@/components/cloud-kitchen/food-location-form";
import { getCloudKitchenMapsConfig } from "@/lib/cloud-kitchen/config";
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
          We validate the address against kitchen delivery coverage before the menu opens.
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

