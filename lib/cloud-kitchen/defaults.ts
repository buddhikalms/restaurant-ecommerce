export const DEFAULT_CLOUD_KITCHEN_NAME = "CeylonTaste Cloud Kitchen";
export const DEFAULT_CLOUD_KITCHEN_SLUG = "ceylontaste-cloud-kitchen";

export const DEFAULT_FOOD_CATEGORY_NAME = "Meals";
export const DEFAULT_FOOD_CATEGORY_SLUG = "meals";

export const DEFAULT_CLOUD_KITCHEN_LOCATION = {
  addressLine1: "15 Market Street",
  city: "London",
  state: "Greater London",
  postalCode: "E1 6AN",
  country: "United Kingdom",
  latitude: 51.5155,
  longitude: -0.0722,
} as const;

export const CLOUD_KITCHEN_SERVICE_DEFAULTS = {
  deliveryTimeMinMins: 40,
  deliveryTimeMaxMins: 60,
  deliveryFee: 10,
  deliveryRadiusMiles: 3,
  deliveryRadiusKm: Number((3 * 1.60934).toFixed(2)),
  pickupFee: 0,
} as const;

