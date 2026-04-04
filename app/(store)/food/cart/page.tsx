import { redirect } from "next/navigation";

import { FoodCartTable } from "@/components/cloud-kitchen/food-cart-table";
import { FoodLocationSummary } from "@/components/cloud-kitchen/food-location-summary";
import { getFoodLocationSession } from "@/lib/cloud-kitchen/location-session";

export default async function FoodCartPage() {
  const selection = await getFoodLocationSession();

  if (!selection) {
    redirect("/food/location");
  }

  return (
    <div className="space-y-6">
      <FoodLocationSummary selection={selection} />

      <section className="surface-card rounded-2xl p-5">
        <p className="section-label">Step 3</p>
        <h1 className="section-title mt-2">Review your food cart</h1>
        <p className="section-copy mt-2">
          Quantities stay locked to the kitchen serving your selected delivery address.
        </p>
      </section>

      <FoodCartTable kitchenName={selection.kitchenName} />
    </div>
  );
}

