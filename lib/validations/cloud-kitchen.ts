import { z } from "zod";

export const foodFulfillmentTypeSchema = z.enum(["DELIVERY", "PICKUP"]);

export const kitchenSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Kitchen name is required"),
  slug: z.string().trim().optional(),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer")
    .optional(),
  phone: z.string().trim().max(40, "Phone must be 40 characters or fewer").optional(),
  email: z.email("Enter a valid email address").trim().optional().or(z.literal("")),
  addressLine1: z.string().trim().min(3, "Address line 1 is required"),
  addressLine2: z
    .string()
    .trim()
    .max(120, "Address line 2 must be 120 characters or fewer")
    .optional(),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  postalCode: z.string().trim().min(2, "Postal code is required"),
  country: z.string().trim().min(2, "Country is required"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  maxDeliveryDistanceKm: z.coerce.number().positive().max(100).nullable().optional(),
  minimumOrderAmount: z.coerce.number().min(0, "Minimum order cannot be negative"),
  deliveryFee: z.coerce.number().min(0, "Delivery fee cannot be negative"),
  freeDeliveryMinimum: z.coerce.number().min(0).nullable().optional(),
  preparationTimeMins: z.coerce.number().int().min(5).max(240),
  isActive: z.boolean(),
  acceptsOrders: z.boolean(),
  sortOrder: z.coerce.number().int().min(0),
});

export const foodCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Category name is required"),
  slug: z.string().trim().optional(),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .optional(),
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

export const foodItemSchema = z
  .object({
    id: z.string().optional(),
    kitchenId: z.string().min(1, "Choose a kitchen"),
    foodCategoryId: z.string().min(1, "Choose a food category"),
    name: z.string().trim().min(2, "Food item name is required"),
    slug: z.string().trim().optional(),
    shortDescription: z
      .string()
      .trim()
      .max(180, "Short description must be 180 characters or fewer")
      .optional(),
    description: z
      .string()
      .trim()
      .min(10, "Description should be at least 10 characters"),
    imageUrl: z.string().trim().url("Enter a valid image URL"),
    price: z.coerce.number().positive("Price must be greater than zero"),
    compareAtPrice: z.coerce.number().positive().nullable().optional(),
    itemType: z.enum(["SINGLE", "COMBO"]),
    offerTitle: z
      .string()
      .trim()
      .max(120, "Offer title must be 120 characters or fewer")
      .optional(),
    offerDescription: z
      .string()
      .trim()
      .max(500, "Offer description must be 500 characters or fewer")
      .optional(),
    includedItemsSummary: z
      .string()
      .trim()
      .max(800, "Included items summary must be 800 characters or fewer")
      .optional(),
    isAvailable: z.boolean(),
    isFeatured: z.boolean(),
    sortOrder: z.coerce.number().int().min(0),
    preparationTimeMins: z.coerce.number().int().min(5).max(240).nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.itemType === "COMBO") {
      if (!value.offerTitle?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["offerTitle"],
          message: "Offer title is required for combo packs",
        });
      }

      if (!value.includedItemsSummary?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["includedItemsSummary"],
          message: "Describe what is included in the combo pack",
        });
      }
    }
  });

export const deliveryZoneSchema = z
  .object({
    id: z.string().optional(),
    kitchenId: z.string().min(1, "Choose a kitchen"),
    name: z.string().trim().min(2, "Zone name is required"),
    description: z
      .string()
      .trim()
      .max(500, "Description must be 500 characters or fewer")
      .optional(),
    zoneType: z.enum(["RADIUS", "POLYGON"]),
    centerLatitude: z.coerce.number().min(-90).max(90).nullable().optional(),
    centerLongitude: z.coerce.number().min(-180).max(180).nullable().optional(),
    radiusKm: z.coerce.number().positive().max(100).nullable().optional(),
    polygonCoordinates: z.array(
      z.object({
        latitude: z.coerce.number().min(-90).max(90),
        longitude: z.coerce.number().min(-180).max(180),
      }),
    ),
    deliveryFee: z.coerce.number().min(0).nullable().optional(),
    minimumOrderAmount: z.coerce.number().min(0).nullable().optional(),
    freeDeliveryMinimum: z.coerce.number().min(0).nullable().optional(),
    isActive: z.boolean(),
    sortOrder: z.coerce.number().int().min(0),
  })
  .superRefine((value, ctx) => {
    if (value.zoneType === "RADIUS") {
      if (value.centerLatitude === null || value.centerLatitude === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["centerLatitude"],
          message: "Center latitude is required for radius zones",
        });
      }

      if (value.centerLongitude === null || value.centerLongitude === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["centerLongitude"],
          message: "Center longitude is required for radius zones",
        });
      }

      if (value.radiusKm === null || value.radiusKm === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["radiusKm"],
          message: "Radius is required for radius zones",
        });
      }
    }

    if (value.zoneType === "POLYGON" && value.polygonCoordinates.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["polygonCoordinates"],
        message: "Add at least 3 polygon points",
      });
    }
  });

export const foodLocationSchema = z.object({
  label: z.string().trim().max(60, "Label must be 60 characters or fewer").optional(),
  line1: z.string().trim().min(3, "Address line 1 is required"),
  line2: z.string().trim().max(120, "Address line 2 must be 120 characters or fewer").optional(),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  postalCode: z.string().trim().min(2, "Postal code is required"),
  country: z.string().trim().min(2, "Country is required"),
  formattedAddress: z
    .string()
    .trim()
    .min(5, "Select a valid mapped address"),
  placeId: z.string().trim().optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  deliveryInstructions: z
    .string()
    .trim()
    .max(500, "Delivery instructions must be 500 characters or fewer")
    .optional(),
});

export const deliveryEligibilitySchema = foodLocationSchema.extend({
  subtotal: z.coerce.number().min(0).optional(),
});

export const saveDeliveryAddressSchema = foodLocationSchema.extend({
  recipientName: z.string().trim().min(2, "Recipient name is required"),
  phone: z.string().trim().min(7, "Phone is required"),
  isDefault: z.boolean().default(false),
});

export const foodOrderItemSchema = z.object({
  foodItemId: z.string().min(1, "Food item is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(99),
  selectedOptions: z
    .array(z.string().trim().min(1, "Selected option is required"))
    .max(12, "Too many selected options")
    .default([]),
});

export const foodOrderSchema = z.object({
  kitchenId: z.string().min(1),
  fulfillmentType: foodFulfillmentTypeSchema,
  deliveryAddress: saveDeliveryAddressSchema,
  items: z.array(foodOrderItemSchema).min(1, "Add at least one food item"),
  notes: z
    .string()
    .trim()
    .max(500, "Order notes must be 500 characters or fewer")
    .optional(),
  saveAddressForLater: z.boolean().default(true),
});

export const foodOrderStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY_FOR_DISPATCH",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export type KitchenInput = z.infer<typeof kitchenSchema>;
export type FoodCategoryInput = z.infer<typeof foodCategorySchema>;
export type FoodItemInput = z.infer<typeof foodItemSchema>;
export type DeliveryZoneInput = z.infer<typeof deliveryZoneSchema>;
export type FoodLocationInput = z.infer<typeof foodLocationSchema>;
export type DeliveryEligibilityInput = z.infer<typeof deliveryEligibilitySchema>;
export type SaveDeliveryAddressInput = z.infer<typeof saveDeliveryAddressSchema>;
export type FoodOrderInput = z.infer<typeof foodOrderSchema>;
export type FoodOrderStatusInput = z.infer<typeof foodOrderStatusSchema>;
export type FoodFulfillmentType = z.infer<typeof foodFulfillmentTypeSchema>;
