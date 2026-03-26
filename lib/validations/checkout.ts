import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().trim().min(1).nullable().optional(),
  quantity: z.number().int().positive("Quantity must be at least 1")
});

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Customer name is required"),
  businessName: z.string().trim().min(2, "Business name is required").optional(),
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  phone: z.string().trim().min(7, "Phone number is required"),
  line1: z.string().trim().min(3, "Address line 1 is required"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State or province is required"),
  postalCode: z.string().trim().min(3, "Postal code is required"),
  country: z.string().trim().min(2, "Country is required"),
  notes: z.string().trim().max(500, "Notes must be 500 characters or fewer").optional(),
  items: z.array(checkoutItemSchema).min(1, "Your cart is empty")
});

export const wholesaleCheckoutSchema = checkoutSchema.extend({
  businessName: z.string().trim().min(2, "Business name is required")
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;