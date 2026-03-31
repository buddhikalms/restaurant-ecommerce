import { z } from "zod";

import {
  getGalleryImageValidationError,
  isValidImageReference,
} from "@/lib/product-gallery";

const productTabContentSchema = z
  .string()
  .trim()
  .max(5000, "Tab content must be 5000 characters or fewer")
  .optional();

const productImageReferenceSchema = z
  .string()
  .trim()
  .optional()
  .superRefine((value, ctx) => {
    if (!value) {
      return;
    }

    if (!isValidImageReference(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Current image reference is invalid",
      });
    }
  });

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Category name is required"),
  slug: z.string().trim().optional(),
  description: z
    .string()
    .trim()
    .max(240, "Description must be 240 characters or fewer")
    .optional(),
  isActive: z.boolean(),
});

export const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Option name is required"),
  sku: z.string().trim().min(2, "Option SKU is required"),
  normalPrice: z.coerce.number().positive("Price must be greater than zero"),
  wholesalePrice: z.coerce
    .number()
    .positive("Wholesale price must be greater than zero"),
  stockQuantity: z.coerce.number().int().min(0, "Stock cannot be negative"),
  minOrderQuantity: z.coerce
    .number()
    .int()
    .min(1, "Minimum order quantity must be at least 1"),
  isActive: z.boolean(),
});

export const productSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(2, "Product name is required"),
    slug: z.string().trim().optional(),
    sku: z.string().trim().min(2, "SKU is required"),
    description: z
      .string()
      .trim()
      .min(10, "Description should be at least 10 characters"),
    information: productTabContentSchema,
    ingredients: productTabContentSchema,
    nutritional: productTabContentSchema,
    faq: productTabContentSchema,
    imageUrl: productImageReferenceSchema,
    retainedGalleryImageUrls: z.array(z.string().trim()).default([]),
    productType: z.enum(["SIMPLE", "VARIABLE"]),
    variantLabel: z
      .string()
      .trim()
      .max(40, "Option label must be 40 characters or fewer")
      .optional(),
    vatMode: z.enum(["INCLUDED", "EXCLUDED"]),
    vatRate: z.coerce
      .number()
      .min(0, "VAT rate cannot be negative")
      .max(100, "VAT rate must be 100 or less"),
    normalPrice: z.coerce.number().min(0, "Price cannot be negative"),
    wholesalePrice: z.coerce
      .number()
      .min(0, "Wholesale price cannot be negative"),
    stockQuantity: z.coerce.number().int().min(0, "Stock cannot be negative"),
    minOrderQuantity: z.coerce
      .number()
      .int()
      .min(1, "Minimum order quantity must be at least 1"),
    categoryId: z.string().min(1, "Choose a category"),
    isActive: z.boolean(),
    variants: z.array(productVariantSchema).default([]),
  })
  .superRefine((value, ctx) => {
    const galleryImageValidationError = getGalleryImageValidationError(
      value.retainedGalleryImageUrls,
    );

    if (galleryImageValidationError) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["retainedGalleryImageUrls"],
        message: galleryImageValidationError,
      });
    }

    if (value.productType === "SIMPLE") {
      if (value.normalPrice <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["normalPrice"],
          message: "Price must be greater than zero",
        });
      }

      if (value.wholesalePrice <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["wholesalePrice"],
          message: "Wholesale price must be greater than zero",
        });
      }

      return;
    }

    if (!value.variantLabel || value.variantLabel.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["variantLabel"],
        message: "Option label is required for variable products",
      });
    }

    if (!value.variants.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["variants"],
        message: "Add at least one purchasable option",
      });
      return;
    }

    if (!value.variants.some((variant) => variant.isActive)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["variants"],
        message: "At least one option must be active",
      });
    }

    const seenSkus = new Set<string>();
    value.variants.forEach((variant, index) => {
      const normalizedSku = variant.sku.trim().toLowerCase();
      if (!normalizedSku) {
        return;
      }

      if (seenSkus.has(normalizedSku)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants", index, "sku"],
          message: "Option SKU must be unique within this product",
        });
      }

      seenSkus.add(normalizedSku);
    });
  });

export const orderStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "COMPLETED",
    "CANCELLED",
  ]),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
