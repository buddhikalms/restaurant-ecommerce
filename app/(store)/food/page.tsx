import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CloudKitchenStorefront } from "@/components/cloud-kitchen/storefront/cloud-kitchen-storefront";
import { getFoodLocationSession } from "@/lib/cloud-kitchen/location-session";
import { getCloudKitchenStorefrontData } from "@/lib/data/cloud-kitchen-storefront";

export const metadata: Metadata = {
  title: "Cloud Kitchen Ordering | CeylonTaste",
  description:
    "Browse foods, customize items, move into checkout, and place real food orders from the main cloud kitchen storefront.",
};

export default async function FoodPage() {
  const selection = await getFoodLocationSession();
  const data = await getCloudKitchenStorefrontData(selection?.kitchenId);

  if (!data) {
    notFound();
  }

  return (
    <CloudKitchenStorefront
      data={data}
      checkoutHref={selection ? "/food/checkout" : "/food/location"}
      checkoutHint={
        selection
          ? null
          : "Choose your delivery or pickup location before checkout so we can validate the kitchen and delivery area."
      }
    />
  );
}
