"use server";

import { Prisma } from "prisma-generated-client-v2";
import { revalidatePath } from "next/cache";

import { ActionResponse } from "@/lib/actions/action-response";
import { requireCustomerUser } from "@/lib/auth-helpers";
import { sendOrderEmails } from "@/lib/email";
import { calculatePriceWithVat } from "@/lib/product-pricing";
import { summarizeActiveProductVariants } from "@/lib/product-variants";
import { prisma } from "@/lib/prisma";
import { getPricingModeForRole } from "@/lib/user-roles";
import { generateOrderNumber } from "@/lib/utils";
import {
  checkoutSchema,
  wholesaleCheckoutSchema,
  type CheckoutInput,
} from "@/lib/validations/checkout";

async function syncVariableProductSnapshot(
  tx: Prisma.TransactionClient,
  productId: string,
) {
  const variants = await tx.productVariant.findMany({
    where: {
      productId,
      isActive: true,
    },
    select: {
      normalPrice: true,
      wholesalePrice: true,
      stockQuantity: true,
      minOrderQuantity: true,
      isActive: true,
    },
  });

  if (!variants.length) {
    return;
  }

  const summary = summarizeActiveProductVariants(variants);

  await tx.product.update({
    where: { id: productId },
    data: summary,
  });
}

export async function placeOrderAction(
  input: CheckoutInput,
): Promise<ActionResponse<{ orderId: string; orderNumber: string }>> {
  const user = await requireCustomerUser();
  const pricingMode = getPricingModeForRole(user.role);
  const parsed = (
    pricingMode === "wholesale" ? wholesaleCheckoutSchema : checkoutSchema
  ).safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the checkout form and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const uniqueProductIds = [...new Set(parsed.data.items.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: {
      id: { in: uniqueProductIds },
      isActive: true,
    },
    include: {
      variants: {
        where: {
          isActive: true,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (products.length !== uniqueProductIds.length) {
    return {
      success: false,
      error: "One or more items in your cart are no longer available.",
    };
  }

  const productMap = new Map(products.map((product) => [product.id, product]));

  let normalizedItems: Array<{
    productId: string;
    productSlug: string;
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    variantId: string | null;
  }>;

  try {
    normalizedItems = parsed.data.items.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error("Product not found");
      }

      const selectedVariant = item.variantId
        ? product.variants.find((variant) => variant.id === item.variantId) ?? null
        : null;

      if (product.productType === "VARIABLE" && !selectedVariant) {
        throw new Error(
          `${product.name} requires a valid ${product.variantLabel?.toLowerCase() || "option"} selection.`,
        );
      }

      if (product.productType === "SIMPLE" && item.variantId) {
        throw new Error(`${product.name} is no longer configured with variable options.`);
      }

      const pricingSource = selectedVariant ?? product;
      const minimumQuantity = pricingMode === "wholesale" ? pricingSource.minOrderQuantity : 1;
      const unitPrice = calculatePriceWithVat(
        pricingMode === "wholesale" ? pricingSource.wholesalePrice : pricingSource.normalPrice,
        product.vatRate,
        product.vatMode,
      );
      const stockQuantity = pricingSource.stockQuantity;
      const productName = selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name;
      const productSku = selectedVariant?.sku ?? product.sku;

      if (item.quantity < minimumQuantity) {
        throw new Error(
          pricingMode === "wholesale"
            ? `${productName} requires a wholesale minimum quantity of ${pricingSource.minOrderQuantity}.`
            : `${productName} requires a quantity of at least 1.`,
        );
      }

      if (item.quantity > stockQuantity) {
        throw new Error(`${productName} does not have enough stock available.`);
      }

      return {
        productId: product.id,
        productSlug: product.slug,
        productName,
        productSku,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
        variantId: selectedVariant?.id ?? null,
      };
    });
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to validate the cart contents.",
    };
  }

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);

  try {
    const order = await prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });

      const shippingAddress = await tx.address.create({
        data: {
          userId: user.id,
          label: "Primary Shipping",
          contactName: parsed.data.customerName,
          businessName: parsed.data.businessName || null,
          line1: parsed.data.line1,
          line2: parsed.data.line2 || null,
          city: parsed.data.city,
          state: parsed.data.state,
          postalCode: parsed.data.postalCode,
          country: parsed.data.country,
          phone: parsed.data.phone,
          isDefault: true,
        },
      });

      const variableProductIdsToSync = new Set<string>();

      for (const item of normalizedItems) {
        if (item.variantId) {
          const updatedVariant = await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              stockQuantity: {
                gte: item.quantity,
              },
            },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });

          if (!updatedVariant.count) {
            throw new Error(`${item.productName} no longer has enough stock available.`);
          }

          variableProductIdsToSync.add(item.productId);
          continue;
        }

        const updatedProduct = await tx.product.updateMany({
          where: {
            id: item.productId,
            stockQuantity: {
              gte: item.quantity,
            },
          },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });

        if (!updatedProduct.count) {
          throw new Error(`${item.productName} no longer has enough stock available.`);
        }
      }

      for (const productId of variableProductIdsToSync) {
        await syncVariableProductSnapshot(tx, productId);
      }

      return tx.order.create({
        data: {
          orderNumber: generateOrderNumber(pricingMode),
          userId: user.id,
          shippingAddressId: shippingAddress.id,
          status: "PENDING",
          notes: parsed.data.notes || null,
          subtotal,
          total: subtotal,
          itemCount,
          items: {
            create: normalizedItems.map(
              ({ productId, productName, productSku, quantity, unitPrice, lineTotal }) => ({
                productId,
                productName,
                productSku,
                quantity,
                unitPrice,
                lineTotal,
              }),
            ),
          },
        },
        include: {
          shippingAddress: true,
          items: true,
        },
      });
    });

    try {
      await sendOrderEmails({
        pricingMode,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        total: Number(order.total),
        customer: {
          name: parsed.data.customerName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          businessName: parsed.data.businessName,
        },
        shippingAddress: {
          line1: order.shippingAddress.line1,
          line2: order.shippingAddress.line2,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
        },
        items: order.items.map((item) => ({
          productName: item.productName,
          productSku: item.productSku,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          lineTotal: Number(item.lineTotal),
        })),
        notes: order.notes,
      });
    } catch (error) {
      console.error("[email] Failed to send order emails", error);
    }

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/checkout");
    for (const slug of [...new Set(normalizedItems.map((item) => item.productSlug))]) {
      revalidatePath(`/products/${slug}`);
    }
    revalidatePath("/account");
    revalidatePath("/account/orders");
    revalidatePath("/wholesale/account");
    revalidatePath("/wholesale/account/orders");
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/customers");

    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      message: "Order placed successfully.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "We couldn't place your order right now. Please try again.",
    };
  }
}
