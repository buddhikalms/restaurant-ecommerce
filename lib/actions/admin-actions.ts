"use server";

import { Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

import { ActionResponse } from "@/lib/actions/action-response";
import { STORE_SETTINGS_SINGLETON_ID } from "@/lib/commerce/constants";
import { requireAdmin } from "@/lib/auth-helpers";
import {
  getGalleryImageValidationError,
  normalizeGalleryImageUrls,
} from "@/lib/product-gallery";
import {
  getUploadedFile,
  getUploadedFiles,
  saveUploadedProductImage,
} from "@/lib/product-image-uploads";
import { summarizeActiveProductVariants } from "@/lib/product-variants";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import {
  paymentMethodSettingSchema,
  shippingMethodSchema,
  shippingZoneSchema,
  storeSettingsSchema,
  type PaymentMethodSettingInput,
  type ShippingMethodInput,
  type ShippingZoneInput,
  type StoreSettingsInput,
} from "@/lib/validations/admin-commerce";
import {
  categorySchema,
  orderStatusSchema,
  productSchema,
  type CategoryInput,
  type ProductInput,
} from "@/lib/validations/admin";

function parseProductPayload(formData: FormData) {
  const payload = formData.get("payload");

  if (typeof payload !== "string") {
    return null;
  }

  try {
    return JSON.parse(payload) as unknown;
  } catch {
    return null;
  }
}

function normalizeVariants(input: ProductInput) {
  return (input.variants ?? []).map((variant, index) => ({
    name: variant.name.trim(),
    sku: variant.sku.trim(),
    normalPrice: variant.normalPrice,
    wholesalePrice: variant.wholesalePrice,
    stockQuantity: variant.stockQuantity,
    minOrderQuantity: variant.minOrderQuantity,
    isActive: variant.isActive,
    position: index,
  }));
}

function normalizeOptionalText(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function buildProductPayload(input: ProductInput) {
  const slug = input.slug || slugify(input.name);
  const variants = normalizeVariants(input);
  const pricingSummary =
    input.productType === "VARIABLE"
      ? summarizeActiveProductVariants(variants)
      : {
          normalPrice: input.normalPrice,
          wholesalePrice: input.wholesalePrice,
          stockQuantity: input.stockQuantity,
          minOrderQuantity: input.minOrderQuantity,
        };
  const imageUrl = input.imageUrl?.trim();

  if (!imageUrl) {
    throw new Error("Upload a product cover image before saving.");
  }

  return {
    slug,
    variants: input.productType === "VARIABLE" ? variants : [],
    productData: {
      name: input.name,
      slug,
      sku: input.sku,
      description: input.description,
      information: normalizeOptionalText(input.information),
      ingredients: normalizeOptionalText(input.ingredients),
      nutritional: normalizeOptionalText(input.nutritional),
      faq: normalizeOptionalText(input.faq),
      imageUrl,
      galleryImageUrls: normalizeGalleryImageUrls(
        imageUrl,
        input.retainedGalleryImageUrls,
      ),
      productType: input.productType,
      variantLabel:
        input.productType === "VARIABLE"
          ? input.variantLabel?.trim() || "Option"
          : null,
      vatMode: input.vatMode,
      vatRate: input.vatRate,
      categoryId: input.categoryId,
      isActive: input.isActive,
      ...pricingSummary,
    },
  };
}

export async function upsertProductAction(
  formData: FormData,
): Promise<ActionResponse<{ id: string }>> {
  await requireAdmin();

  const payload = parseProductPayload(formData);

  if (!payload) {
    return {
      success: false,
      error: "Please refresh the form and try again.",
    };
  }

  const parsed = productSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the product form and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existingProduct = parsed.data.id
    ? await prisma.product.findUnique({
        where: { id: parsed.data.id },
        select: { slug: true },
      })
    : null;

  try {
    const primaryImageFile = getUploadedFile(formData.get("primaryImageFile"));
    const galleryImageFiles = getUploadedFiles(
      formData.getAll("galleryImageFiles"),
    );

    let imageUrl = parsed.data.imageUrl?.trim() ?? "";

    if (!imageUrl && !primaryImageFile) {
      return {
        success: false,
        error: "Upload a product cover image before saving.",
        fieldErrors: {
          imageUrl: ["Upload a product cover image before saving."],
        },
      };
    }

    if (
      parsed.data.retainedGalleryImageUrls.length + galleryImageFiles.length >
      8
    ) {
      return {
        success: false,
        error: "You can keep up to 8 gallery images.",
        fieldErrors: {
          retainedGalleryImageUrls: ["You can keep up to 8 gallery images."],
        },
      };
    }

    if (primaryImageFile) {
      imageUrl = await saveUploadedProductImage(primaryImageFile);
    }

    const uploadedGalleryImageUrls = await Promise.all(
      galleryImageFiles.map((file) => saveUploadedProductImage(file)),
    );
    const retainedGalleryImageUrls = [
      ...parsed.data.retainedGalleryImageUrls,
      ...uploadedGalleryImageUrls,
    ];
    const galleryImageValidationError = getGalleryImageValidationError(
      retainedGalleryImageUrls,
    );

    if (galleryImageValidationError) {
      return {
        success: false,
        error: galleryImageValidationError,
        fieldErrors: {
          retainedGalleryImageUrls: [galleryImageValidationError],
        },
      };
    }

    const normalizedInput: ProductInput = {
      ...parsed.data,
      imageUrl,
      retainedGalleryImageUrls,
    };
    const normalizedPayload = buildProductPayload(normalizedInput);

    const product = await prisma.$transaction(async (tx) => {
      const savedProduct = parsed.data.id
        ? await tx.product.update({
            where: { id: parsed.data.id },
            data: normalizedPayload.productData,
          })
        : await tx.product.create({
            data: normalizedPayload.productData,
          });

      await tx.productVariant.deleteMany({
        where: {
          productId: savedProduct.id,
        },
      });

      if (normalizedPayload.variants.length) {
        await tx.productVariant.createMany({
          data: normalizedPayload.variants.map((variant) => ({
            productId: savedProduct.id,
            ...variant,
          })),
        });
      }

      return savedProduct;
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    if (existingProduct?.slug && existingProduct.slug !== product.slug) {
      revalidatePath(`/products/${existingProduct.slug}`);
    }
    revalidatePath("/admin");
    revalidatePath("/admin/products");

    return {
      success: true,
      data: { id: product.id },
      message: parsed.data.id ? "Product updated." : "Product created.",
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error:
          "A product, product slug, or option SKU with this value already exists.",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to save the product right now.",
    };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResponse> {
  await requireAdmin();

  try {
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product deleted.",
    };
  } catch {
    return {
      success: false,
      error:
        "This product cannot be deleted because it is linked to existing orders.",
    };
  }
}

export async function upsertCategoryAction(
  input: CategoryInput,
): Promise<ActionResponse<{ id: string }>> {
  await requireAdmin();

  const parsed = categorySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the category form and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const category = parsed.data.id
      ? await prisma.category.update({
          where: { id: parsed.data.id },
          data: {
            name: parsed.data.name,
            slug: parsed.data.slug || slugify(parsed.data.name),
            description: parsed.data.description || null,
            isActive: parsed.data.isActive,
          },
        })
      : await prisma.category.create({
          data: {
            name: parsed.data.name,
            slug: parsed.data.slug || slugify(parsed.data.name),
            description: parsed.data.description || null,
            isActive: parsed.data.isActive,
          },
        });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/categories");

    return {
      success: true,
      data: { id: category.id },
      message: parsed.data.id ? "Category updated." : "Category created.",
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "A category with this name or slug already exists.",
      };
    }

    return {
      success: false,
      error: "Unable to save the category right now.",
    };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResponse> {
  await requireAdmin();

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!category) {
    return {
      success: false,
      error: "Category not found.",
    };
  }

  if (category._count.products > 0) {
    return {
      success: false,
      error: "Remove products from this category before deleting it.",
    };
  }

  await prisma.category.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/categories");

  return {
    success: true,
    message: "Category deleted.",
  };
}

export async function updateOrderStatusAction(input: {
  id: string;
  status: string;
}): Promise<ActionResponse> {
  await requireAdmin();

  const parsed = orderStatusSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please choose a valid status.",
    };
  }

  await prisma.order.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.data.id}`);
  revalidatePath("/account/orders");
  revalidatePath("/wholesale/account/orders");

  return {
    success: true,
    message: "Order status updated.",
  };
}


function splitTextareaValues(value?: string | null) {
  return (value ?? "")
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function normalizeAdminOptionalText(value?: string | null) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

export async function upsertStoreSettingsAction(
  input: StoreSettingsInput,
): Promise<ActionResponse> {
  await requireAdmin();

  const parsed = storeSettingsSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the store settings and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.storeSettings.upsert({
    where: { id: STORE_SETTINGS_SINGLETON_ID },
    update: {
      deliveryNotes: normalizeAdminOptionalText(parsed.data.deliveryNotes),
      defaultHandlingFee: parsed.data.defaultHandlingFee,
      weightUnit: parsed.data.weightUnit,
      dimensionUnit: parsed.data.dimensionUnit,
      mapsEnabled: parsed.data.mapsEnabled,
      googleMapsApiKey: normalizeAdminOptionalText(parsed.data.googleMapsApiKey),
      defaultMapLatitude: parsed.data.defaultMapLatitude ?? null,
      defaultMapLongitude: parsed.data.defaultMapLongitude ?? null,
      defaultMapZoom: parsed.data.defaultMapZoom,
      storeLocationName: normalizeAdminOptionalText(parsed.data.storeLocationName),
      storeAddress: normalizeAdminOptionalText(parsed.data.storeAddress),
      storeLatitude: parsed.data.storeLatitude ?? null,
      storeLongitude: parsed.data.storeLongitude ?? null,
      serviceAreaCountries: splitTextareaValues(parsed.data.serviceAreaCountriesText),
    },
    create: {
      id: STORE_SETTINGS_SINGLETON_ID,
      deliveryNotes: normalizeAdminOptionalText(parsed.data.deliveryNotes),
      defaultHandlingFee: parsed.data.defaultHandlingFee,
      weightUnit: parsed.data.weightUnit,
      dimensionUnit: parsed.data.dimensionUnit,
      mapsEnabled: parsed.data.mapsEnabled,
      googleMapsApiKey: normalizeAdminOptionalText(parsed.data.googleMapsApiKey),
      defaultMapLatitude: parsed.data.defaultMapLatitude ?? null,
      defaultMapLongitude: parsed.data.defaultMapLongitude ?? null,
      defaultMapZoom: parsed.data.defaultMapZoom,
      storeLocationName: normalizeAdminOptionalText(parsed.data.storeLocationName),
      storeAddress: normalizeAdminOptionalText(parsed.data.storeAddress),
      storeLatitude: parsed.data.storeLatitude ?? null,
      storeLongitude: parsed.data.storeLongitude ?? null,
      serviceAreaCountries: splitTextareaValues(parsed.data.serviceAreaCountriesText),
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");

  return {
    success: true,
    message: "Store settings updated.",
  };
}

export async function upsertShippingZoneAction(
  input: ShippingZoneInput,
): Promise<ActionResponse<{ id: string }>> {
  await requireAdmin();

  const parsed = shippingZoneSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the shipping zone details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const zone = await prisma.$transaction(async (tx) => {
    const savedZone = parsed.data.id
      ? await tx.shippingZone.update({
          where: { id: parsed.data.id },
          data: {
            name: parsed.data.name,
            description: normalizeAdminOptionalText(parsed.data.description),
            isEnabled: parsed.data.isEnabled,
            sortOrder: parsed.data.sortOrder,
          },
        })
      : await tx.shippingZone.create({
          data: {
            name: parsed.data.name,
            description: normalizeAdminOptionalText(parsed.data.description),
            isEnabled: parsed.data.isEnabled,
            sortOrder: parsed.data.sortOrder,
          },
        });

    await tx.shippingZoneRegion.deleteMany({
      where: {
        shippingZoneId: savedZone.id,
      },
    });

    if (parsed.data.regions.length) {
      await tx.shippingZoneRegion.createMany({
        data: parsed.data.regions.map((region, index) => ({
          shippingZoneId: savedZone.id,
          country: normalizeAdminOptionalText(region.country),
          state: normalizeAdminOptionalText(region.state),
          city: normalizeAdminOptionalText(region.city),
          postalCodePattern: normalizeAdminOptionalText(region.postalCodePattern),
          sortOrder: region.sortOrder ?? index,
        })),
      });
    }

    return savedZone;
  });

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");

  return {
    success: true,
    data: { id: zone.id },
    message: parsed.data.id ? "Shipping zone updated." : "Shipping zone created.",
  };
}

export async function deleteShippingZoneAction(id: string): Promise<ActionResponse> {
  await requireAdmin();

  await prisma.shippingZone.delete({
    where: { id },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");

  return {
    success: true,
    message: "Shipping zone deleted.",
  };
}

export async function upsertShippingMethodAction(
  input: ShippingMethodInput,
): Promise<ActionResponse<{ id: string }>> {
  await requireAdmin();

  const parsed = shippingMethodSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the shipping method and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const method = await prisma.$transaction(async (tx) => {
    const savedMethod = parsed.data.id
      ? await tx.shippingMethod.update({
          where: { id: parsed.data.id },
          data: {
            shippingZoneId: parsed.data.shippingZoneId,
            name: parsed.data.name,
            description: normalizeAdminOptionalText(parsed.data.description),
            type: parsed.data.type,
            baseCost: parsed.data.baseCost,
            minimumOrderAmount: parsed.data.minimumOrderAmount ?? null,
            maximumOrderAmount: parsed.data.maximumOrderAmount ?? null,
            minimumWeight: parsed.data.minimumWeight ?? null,
            maximumWeight: parsed.data.maximumWeight ?? null,
            freeShippingMinimum: parsed.data.freeShippingMinimum ?? null,
            maximumDistanceKm: parsed.data.maximumDistanceKm ?? null,
            sortOrder: parsed.data.sortOrder,
            estimatedMinDays: parsed.data.estimatedMinDays ?? null,
            estimatedMaxDays: parsed.data.estimatedMaxDays ?? null,
            instructions: normalizeAdminOptionalText(parsed.data.instructions),
            isEnabled: parsed.data.isEnabled,
            codAllowed: parsed.data.codAllowed,
          },
        })
      : await tx.shippingMethod.create({
          data: {
            shippingZoneId: parsed.data.shippingZoneId,
            name: parsed.data.name,
            description: normalizeAdminOptionalText(parsed.data.description),
            type: parsed.data.type,
            baseCost: parsed.data.baseCost,
            minimumOrderAmount: parsed.data.minimumOrderAmount ?? null,
            maximumOrderAmount: parsed.data.maximumOrderAmount ?? null,
            minimumWeight: parsed.data.minimumWeight ?? null,
            maximumWeight: parsed.data.maximumWeight ?? null,
            freeShippingMinimum: parsed.data.freeShippingMinimum ?? null,
            maximumDistanceKm: parsed.data.maximumDistanceKm ?? null,
            sortOrder: parsed.data.sortOrder,
            estimatedMinDays: parsed.data.estimatedMinDays ?? null,
            estimatedMaxDays: parsed.data.estimatedMaxDays ?? null,
            instructions: normalizeAdminOptionalText(parsed.data.instructions),
            isEnabled: parsed.data.isEnabled,
            codAllowed: parsed.data.codAllowed,
          },
        });

    await tx.shippingRateTier.deleteMany({
      where: {
        shippingMethodId: savedMethod.id,
      },
    });

    if (parsed.data.tiers.length) {
      await tx.shippingRateTier.createMany({
        data: parsed.data.tiers.map((tier, index) => ({
          shippingMethodId: savedMethod.id,
          label: normalizeAdminOptionalText(tier.label),
          minimumValue: tier.minimumValue ?? null,
          maximumValue: tier.maximumValue ?? null,
          cost: tier.cost,
          sortOrder: tier.sortOrder ?? index,
        })),
      });
    }

    return savedMethod;
  });

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");

  return {
    success: true,
    data: { id: method.id },
    message: parsed.data.id ? "Shipping method updated." : "Shipping method created.",
  };
}

export async function deleteShippingMethodAction(id: string): Promise<ActionResponse> {
  await requireAdmin();

  await prisma.shippingMethod.delete({
    where: { id },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");

  return {
    success: true,
    message: "Shipping method deleted.",
  };
}

export async function upsertPaymentMethodSettingAction(
  input: PaymentMethodSettingInput,
): Promise<ActionResponse> {
  await requireAdmin();

  const parsed = paymentMethodSettingSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the payment method settings and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.paymentMethodSetting.upsert({
    where: { gateway: parsed.data.gateway },
    update: {
      displayName: parsed.data.displayName,
      instructions: normalizeAdminOptionalText(parsed.data.instructions),
      isEnabled: parsed.data.isEnabled,
      mode: parsed.data.mode,
      publicKey: normalizeAdminOptionalText(parsed.data.publicKey),
      secretKey: normalizeAdminOptionalText(parsed.data.secretKey),
      webhookSecret: normalizeAdminOptionalText(parsed.data.webhookSecret),
      extraFee: parsed.data.extraFee,
      minimumOrderAmount: parsed.data.minimumOrderAmount ?? null,
      maximumOrderAmount: parsed.data.maximumOrderAmount ?? null,
      allowedShippingMethodTypes: parsed.data.allowedShippingMethodTypes,
      allowedZoneIds: parsed.data.allowedZoneIds,
    },
    create: {
      gateway: parsed.data.gateway,
      displayName: parsed.data.displayName,
      instructions: normalizeAdminOptionalText(parsed.data.instructions),
      isEnabled: parsed.data.isEnabled,
      mode: parsed.data.mode,
      publicKey: normalizeAdminOptionalText(parsed.data.publicKey),
      secretKey: normalizeAdminOptionalText(parsed.data.secretKey),
      webhookSecret: normalizeAdminOptionalText(parsed.data.webhookSecret),
      extraFee: parsed.data.extraFee,
      minimumOrderAmount: parsed.data.minimumOrderAmount ?? null,
      maximumOrderAmount: parsed.data.maximumOrderAmount ?? null,
      allowedShippingMethodTypes: parsed.data.allowedShippingMethodTypes,
      allowedZoneIds: parsed.data.allowedZoneIds,
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");

  return {
    success: true,
    message: `${parsed.data.displayName} settings updated.`,
  };
}

