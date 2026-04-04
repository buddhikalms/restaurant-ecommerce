import { cookies } from "next/headers";
import { z } from "zod";

export const FOOD_LOCATION_COOKIE_NAME = "ceylontaste-food-location";

const foodLocationSessionSchema = z.object({
  kitchenId: z.string(),
  kitchenName: z.string(),
  deliveryZoneId: z.string().nullable(),
  deliveryZoneName: z.string().nullable(),
  distanceKm: z.number().nullable(),
  address: z.object({
    label: z.string().nullable(),
    line1: z.string(),
    line2: z.string().nullable(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
    formattedAddress: z.string(),
    placeId: z.string().nullable(),
    latitude: z.number(),
    longitude: z.number(),
    deliveryInstructions: z.string().nullable(),
  }),
  checkedAt: z.string(),
});

export type FoodLocationSession = z.infer<typeof foodLocationSessionSchema>;

export async function getFoodLocationSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(FOOD_LOCATION_COOKIE_NAME)?.value;

  if (!raw) {
    return null;
  }

  try {
    return foodLocationSessionSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function setFoodLocationSession(session: FoodLocationSession) {
  const cookieStore = await cookies();
  cookieStore.set(FOOD_LOCATION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function clearFoodLocationSession() {
  const cookieStore = await cookies();
  cookieStore.delete(FOOD_LOCATION_COOKIE_NAME);
}

