"use server";

import { Prisma } from "prisma-generated-client-v2";
import { revalidatePath } from "next/cache";

import { ActionResponse } from "@/lib/actions/action-response";
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
