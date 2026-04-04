import { env } from "@/lib/env";

function toNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getCloudKitchenMapsConfig() {
  return {
    apiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? null,
    mapId: env.NEXT_PUBLIC_GOOGLE_MAP_ID ?? null,
    defaultCenter: {
      latitude: toNumber(env.NEXT_PUBLIC_CLOUD_KITCHEN_DEFAULT_LATITUDE, 6.9271),
      longitude: toNumber(env.NEXT_PUBLIC_CLOUD_KITCHEN_DEFAULT_LONGITUDE, 79.8612),
    },
    defaultZoom: toNumber(env.NEXT_PUBLIC_CLOUD_KITCHEN_DEFAULT_ZOOM, 13),
  };
}

