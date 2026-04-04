import { getKitchenDeliveryCoverage } from "@/lib/data/cloud-kitchen";
import { calculateDistanceKm, matchesDeliveryZone, type GeoPoint } from "@/lib/cloud-kitchen/delivery";

export type DeliveryEligibilityResult =
  | {
      eligible: true;
      kitchen: {
        id: string;
        name: string;
        slug: string;
      };
      deliveryZone: {
        id: string;
        name: string;
      } | null;
      distanceKm: number | null;
      deliveryFee: number;
      minimumOrderAmount: number;
      freeDeliveryMinimum: number | null;
      message: string;
    }
  | {
      eligible: false;
      message: string;
    };

type KitchenDeliveryCoverage = Awaited<ReturnType<typeof getKitchenDeliveryCoverage>>[number];
type DeliveryZoneCoverage = KitchenDeliveryCoverage["deliveryZones"][number];

type DeliveryCandidate = {
  kitchen: KitchenDeliveryCoverage;
  deliveryZone: DeliveryZoneCoverage | null;
  distanceKm: number | null;
  deliveryFee: number;
  minimumOrderAmount: number;
  freeDeliveryMinimum: number | null;
};

export async function resolveDeliveryEligibility({
  location,
  subtotal = 0,
}: {
  location: GeoPoint;
  subtotal?: number;
}): Promise<DeliveryEligibilityResult> {
  const kitchens = await getKitchenDeliveryCoverage();

  if (!kitchens.length) {
    return {
      eligible: false,
      message: "No cloud kitchens are accepting orders right now.",
    };
  }

  const candidates: DeliveryCandidate[] = kitchens.flatMap((kitchen): DeliveryCandidate[] => {
    const zoneMatches: DeliveryCandidate[] = kitchen.deliveryZones
      .map((zone): DeliveryCandidate | null => {
        const result = matchesDeliveryZone(zone, location);

        if (!result.matches) {
          return null;
        }

        const baseDeliveryFee = zone.deliveryFee ?? kitchen.deliveryFee;
        const freeDeliveryMinimum = zone.freeDeliveryMinimum ?? kitchen.freeDeliveryMinimum;
        const deliveryFee =
          freeDeliveryMinimum !== null && subtotal >= freeDeliveryMinimum ? 0 : baseDeliveryFee;

        return {
          kitchen,
          deliveryZone: zone,
          distanceKm: result.distanceKm,
          deliveryFee,
          minimumOrderAmount: zone.minimumOrderAmount ?? kitchen.minimumOrderAmount,
          freeDeliveryMinimum,
        };
      })
      .filter((entry): entry is DeliveryCandidate => entry !== null);

    if (zoneMatches.length) {
      return zoneMatches;
    }

    if (!kitchen.maxDeliveryDistanceKm) {
      return [];
    }

    const distanceKm = calculateDistanceKm(
      {
        latitude: kitchen.latitude,
        longitude: kitchen.longitude,
      },
      location,
    );

    if (distanceKm > kitchen.maxDeliveryDistanceKm) {
      return [];
    }

    const deliveryFee =
      kitchen.freeDeliveryMinimum !== null && subtotal >= kitchen.freeDeliveryMinimum
        ? 0
        : kitchen.deliveryFee;

    return [
      {
        kitchen,
        deliveryZone: null,
        distanceKm,
        deliveryFee,
        minimumOrderAmount: kitchen.minimumOrderAmount,
        freeDeliveryMinimum: kitchen.freeDeliveryMinimum,
      },
    ];
  });

  if (!candidates.length) {
    return {
      eligible: false,
      message: "That address is outside our current delivery radius.",
    };
  }

  candidates.sort((left, right) => {
    const leftDistance = left.distanceKm ?? Number.MAX_SAFE_INTEGER;
    const rightDistance = right.distanceKm ?? Number.MAX_SAFE_INTEGER;

    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    return left.deliveryFee - right.deliveryFee;
  });

  const selected = candidates[0];

  return {
    eligible: true,
    kitchen: {
      id: selected.kitchen.id,
      name: selected.kitchen.name,
      slug: selected.kitchen.slug,
    },
    deliveryZone: selected.deliveryZone
      ? {
          id: selected.deliveryZone.id,
          name: selected.deliveryZone.name,
        }
      : null,
    distanceKm: selected.distanceKm,
    deliveryFee: selected.deliveryFee,
    minimumOrderAmount: selected.minimumOrderAmount,
    freeDeliveryMinimum: selected.freeDeliveryMinimum,
    message: selected.deliveryZone
      ? `Delivery is available from ${selected.kitchen.name} in the ${selected.deliveryZone.name} zone.`
      : `Delivery is available from ${selected.kitchen.name}.`,
  };
}

