"use server";

import { Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

import { type ActionResponse } from "@/lib/actions/action-response";
import { requireAdmin, requireRetailUser } from "@/lib/auth-helpers";
import { clearFoodLocationSession, setFoodLocationSession } from "@/lib/cloud-kitchen/location-session";
import { resolveDeliveryEligibility } from "@/lib/cloud-kitchen/service";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber, slugify } from "@/lib/utils";
import {
  deliveryEligibilitySchema,
  deliveryZoneSchema,
  foodCategorySchema,
  foodItemSchema,
  foodOrderSchema,
  foodOrderStatusSchema,
  kitchenSchema,
  saveDeliveryAddressSchema,
  type DeliveryZoneInput,
  type FoodCategoryInput,
  type FoodItemInput,
  type FoodOrderInput,
  type KitchenInput,
  type SaveDeliveryAddressInput,
} from "@/lib/validations/cloud-kitchen";

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function buildCloudKitchenError<T = void>(error: unknown, fallback: string): ActionResponse<T> {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return {
      success: false,
      error: "A record with that name, slug, or unique value already exists.",
    };
  }

  return {
    success: false,
    error: error instanceof Error ? error.message : fallback,
  };
}

function revalidateCloudKitchenPaths() {
  revalidatePath("/food");
  revalidatePath("/food/location");
  revalidatePath("/food/menu");
  revalidatePath("/food/cart");
  revalidatePath("/food/checkout");
  revalidatePath("/account/food-orders");
  revalidatePath("/admin/cloud-kitchen");
  revalidatePath("/admin/cloud-kitchen/kitchens");
  revalidatePath("/admin/cloud-kitchen/categories");
  revalidatePath("/admin/cloud-kitchen/foods");
  revalidatePath("/admin/cloud-kitchen/orders");
  revalidatePath("/admin/cloud-kitchen/delivery-zones");
}

async function persistDeliveryAddress(
  userId: string,
  input: SaveDeliveryAddressInput,
  preferDefault = false,
) {
  return prisma.$transaction(async (tx) => {
    const existingDefault = await tx.deliveryAddress.findFirst({
      where: {
        userId,
        isDefault: true,
      },
      select: {
        id: true,
      },
    });

    const existingAddress = await tx.deliveryAddress.findFirst({
      where: {
        userId,
        OR: [
          ...(input.placeId ? [{ placeId: input.placeId }] : []),
          { formattedAddress: input.formattedAddress },
        ],
      },
      select: {
        id: true,
      },
    });

    const isDefault = preferDefault || !existingDefault;

    if (isDefault) {
      await tx.deliveryAddress.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const data = {
      label: normalizeOptionalText(input.label),
      recipientName: input.recipientName,
      phone: input.phone,
      line1: input.line1,
      line2: normalizeOptionalText(input.line2),
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      country: input.country,
      formattedAddress: input.formattedAddress,
      placeId: normalizeOptionalText(input.placeId),
      latitude: input.latitude,
      longitude: input.longitude,
      deliveryInstructions: normalizeOptionalText(input.deliveryInstructions),
      isDefault,
    };

    if (existingAddress) {
      return tx.deliveryAddress.update({
        where: { id: existingAddress.id },
        data,
      });
    }

    return tx.deliveryAddress.create({
      data: {
        userId,
        ...data,
      },
    });
  });
}

export async function validateDeliveryEligibilityAction(input: unknown): Promise<
  ActionResponse<{
    kitchenId: string;
    kitchenName: string;
    kitchenSlug: string;
    fulfillmentType: "DELIVERY";
    deliveryZoneId: string | null;
    deliveryZoneName: string | null;
    distanceKm: number | null;
    deliveryFee: number;
    minimumOrderAmount: number;
    freeDeliveryMinimum: number | null;
    message: string;
  }>
> {
  const parsed = deliveryEligibilitySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please select a valid mapped delivery address.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const eligibility = await resolveDeliveryEligibility({
    location: {
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
    },
    subtotal: parsed.data.subtotal ?? 0,
  });

  if (!eligibility.eligible) {
    return {
      success: false,
      error: eligibility.message,
    };
  }

  await setFoodLocationSession({
    kitchenId: eligibility.kitchen.id,
    kitchenName: eligibility.kitchen.name,
    fulfillmentType: "DELIVERY",
    deliveryZoneId: eligibility.deliveryZone?.id ?? null,
    deliveryZoneName: eligibility.deliveryZone?.name ?? null,
    distanceKm: eligibility.distanceKm,
    checkedAt: new Date().toISOString(),
    address: {
      label: normalizeOptionalText(parsed.data.label),
      line1: parsed.data.line1,
      line2: normalizeOptionalText(parsed.data.line2),
      city: parsed.data.city,
      state: parsed.data.state,
      postalCode: parsed.data.postalCode,
      country: parsed.data.country,
      formattedAddress: parsed.data.formattedAddress,
      placeId: normalizeOptionalText(parsed.data.placeId),
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      deliveryInstructions: normalizeOptionalText(parsed.data.deliveryInstructions),
    },
  });

  return {
    success: true,
    data: {
      kitchenId: eligibility.kitchen.id,
      kitchenName: eligibility.kitchen.name,
      kitchenSlug: eligibility.kitchen.slug,
      fulfillmentType: "DELIVERY",
      deliveryZoneId: eligibility.deliveryZone?.id ?? null,
      deliveryZoneName: eligibility.deliveryZone?.name ?? null,
      distanceKm: eligibility.distanceKm,
      deliveryFee: eligibility.deliveryFee,
      minimumOrderAmount: eligibility.minimumOrderAmount,
      freeDeliveryMinimum: eligibility.freeDeliveryMinimum,
      message: eligibility.message,
    },
    message: eligibility.message,
  };
}

export async function selectPickupKitchenAction(): Promise<
  ActionResponse<{
    kitchenId: string;
    kitchenName: string;
    fulfillmentType: "PICKUP";
    message: string;
  }>
> {
  const kitchen = await prisma.kitchen.findFirst({
    where: {
      isActive: true,
      acceptsOrders: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  if (!kitchen) {
    return {
      success: false,
      error: "No cloud kitchen is accepting pickup orders right now.",
    };
  }

  const formattedAddress = [
    kitchen.addressLine1,
    kitchen.addressLine2,
    kitchen.city,
    kitchen.state,
    kitchen.postalCode,
    kitchen.country,
  ]
    .filter(Boolean)
    .join(", ");

  await setFoodLocationSession({
    kitchenId: kitchen.id,
    kitchenName: kitchen.name,
    fulfillmentType: "PICKUP",
    deliveryZoneId: null,
    deliveryZoneName: null,
    distanceKm: null,
    checkedAt: new Date().toISOString(),
    address: {
      label: "Pickup",
      line1: kitchen.addressLine1,
      line2: normalizeOptionalText(kitchen.addressLine2),
      city: kitchen.city,
      state: kitchen.state,
      postalCode: kitchen.postalCode,
      country: kitchen.country,
      formattedAddress,
      placeId: null,
      latitude: Number(kitchen.latitude),
      longitude: Number(kitchen.longitude),
      deliveryInstructions: null,
    },
  });

  return {
    success: true,
    data: {
      kitchenId: kitchen.id,
      kitchenName: kitchen.name,
      fulfillmentType: "PICKUP",
      message: "Pickup selected from " + kitchen.name + ".",
    },
    message: "Pickup selected from " + kitchen.name + ".",
  };
}
export async function clearDeliveryEligibilityAction(): Promise<ActionResponse> {
  await clearFoodLocationSession();

  return {
    success: true,
    message: "Delivery location cleared.",
  };
}

export async function saveDeliveryAddressAction(
  input: SaveDeliveryAddressInput,
): Promise<ActionResponse<{ id: string }>> {
  const user = await requireRetailUser();
  const parsed = saveDeliveryAddressSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the delivery address details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const address = await persistDeliveryAddress(user.id, parsed.data, parsed.data.isDefault);

    revalidatePath("/account/settings");
    revalidatePath("/food/checkout");
    revalidatePath("/account/food-orders");

    return {
      success: true,
      data: { id: address.id },
      message: "Delivery address saved.",
    };
  } catch (error) {
    return buildCloudKitchenError(error, "Unable to save the delivery address.");
  }
}

export async function upsertKitchenAction(
  input: KitchenInput,
): Promise<ActionResponse<{ id: string }>> {
  await requireAdmin();
  const parsed = kitchenSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the kitchen details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const kitchen = parsed.data.id
      ? await prisma.kitchen.update({
          where: { id: parsed.data.id },
          data: {
            name: parsed.data.name,
            slug: parsed.data.slug || slugify(parsed.data.name),
            description: normalizeOptionalText(parsed.data.description),
            phone: normalizeOptionalText(parsed.data.phone),
            email: normalizeOptionalText(parsed.data.email),
            addressLine1: parsed.data.addressLine1,
            addressLine2: normalizeOptionalText(parsed.data.addressLine2),
            city: parsed.data.city,
            state: parsed.data.state,
            postalCode: parsed.data.postalCode,
            country: parsed.data.country,
            latitude: parsed.data.latitude,
            longitude: parsed.data.longitude,
            maxDeliveryDistanceKm: parsed.data.maxDeliveryDistanceKm ?? null,
            minimumOrderAmount: parsed.data.minimumOrderAmount,
            deliveryFee: parsed.data.deliveryFee,
            freeDeliveryMinimum: parsed.data.freeDeliveryMinimum ?? null,
            preparationTimeMins: parsed.data.preparationTimeMins,
            isActive: parsed.data.isActive,
            acceptsOrders: parsed.data.acceptsOrders,
            sortOrder: parsed.data.sortOrder,
          },
        })
      : await prisma.kitchen.create({
          data: {
            name: parsed.data.name,
            slug: parsed.data.slug || slugify(parsed.data.name),
            description: normalizeOptionalText(parsed.data.description),
            phone: normalizeOptionalText(parsed.data.phone),
            email: normalizeOptionalText(parsed.data.email),
            addressLine1: parsed.data.addressLine1,
            addressLine2: normalizeOptionalText(parsed.data.addressLine2),
            city: parsed.data.city,
            state: parsed.data.state,
            postalCode: parsed.data.postalCode,
            country: parsed.data.country,
            latitude: parsed.data.latitude,
            longitude: parsed.data.longitude,
            maxDeliveryDistanceKm: parsed.data.maxDeliveryDistanceKm ?? null,
            minimumOrderAmount: parsed.data.minimumOrderAmount,
            deliveryFee: parsed.data.deliveryFee,
            freeDeliveryMinimum: parsed.data.freeDeliveryMinimum ?? null,
            preparationTimeMins: parsed.data.preparationTimeMins,
            isActive: parsed.data.isActive,
            acceptsOrders: parsed.data.acceptsOrders,
            sortOrder: parsed.data.sortOrder,
          },
        });

    revalidateCloudKitchenPaths();

    return {
      success: true,
      data: { id: kitchen.id },
      message: parsed.data.id ? "Kitchen updated." : "Kitchen created.",
    };
  } catch (error) {
    return buildCloudKitchenError(error, "Unable to save the kitchen.");
  }
}

export async function deleteKitchenAction(id: string): Promise<ActionResponse> {
  await requireAdmin();

  try {
    await prisma.kitchen.delete({
      where: { id },
    });

    revalidateCloudKitchenPaths();

    return {
      success: true,
      message: "Kitchen deleted.",
    };
  } catch {
    return {
      success: false,
      error: "This kitchen cannot be deleted because it is linked to food items or orders.",
    };
  }
}

export async function upsertFoodCategoryAction(
  input: FoodCategoryInput,
): Promise<ActionResponse<{ id: string }>> {
  await requireAdmin();
  const parsed = foodCategorySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the food category and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const category = parsed.data.id
      ? await prisma.foodCategory.update({
          where: { id: parsed.data.id },
          data: {
            name: parsed.data.name,
            slug: parsed.data.slug || slugify(parsed.data.name),
            description: normalizeOptionalText(parsed.data.description),
            sortOrder: parsed.data.sortOrder,
            isActive: parsed.data.isActive,
          },
        })
      : await prisma.foodCategory.create({
          data: {
            name: parsed.data.name,
            slug: parsed.data.slug || slugify(parsed.data.name),
            description: normalizeOptionalText(parsed.data.description),
            sortOrder: parsed.data.sortOrder,
            isActive: parsed.data.isActive,
          },
        });

    revalidateCloudKitchenPaths();

    return {
      success: true,
      data: { id: category.id },
      message: parsed.data.id ? "Food category updated." : "Food category created.",
    };
  } catch (error) {
    return buildCloudKitchenError(error, "Unable to save the food category.");
  }
}

export async function deleteFoodCategoryAction(id: string): Promise<ActionResponse> {
  await requireAdmin();

  try {
    await prisma.foodCategory.delete({
      where: { id },
    });

    revalidateCloudKitchenPaths();

    return {
      success: true,
      message: "Food category deleted.",
    };
  } catch {
    return {
      success: false,
      error: "Remove food items from this category before deleting it.",
    };
  }
}

export async function upsertFoodItemAction(
  input: FoodItemInput,
): Promise<ActionResponse<{ id: string }>> {
  await requireAdmin();
  const parsed = foodItemSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the food item and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const foodItemData = {
      kitchenId: parsed.data.kitchenId,
      foodCategoryId: parsed.data.foodCategoryId,
      name: parsed.data.name,
      slug: parsed.data.slug || slugify(parsed.data.name),
      shortDescription: normalizeOptionalText(parsed.data.shortDescription),
      description: parsed.data.description,
      imageUrl: parsed.data.imageUrl,
      price: parsed.data.price,
      compareAtPrice: parsed.data.compareAtPrice ?? null,
      itemType: parsed.data.itemType,
      offerTitle:
        parsed.data.itemType === "COMBO"
          ? normalizeOptionalText(parsed.data.offerTitle)
          : null,
      offerDescription:
        parsed.data.itemType === "COMBO"
          ? normalizeOptionalText(parsed.data.offerDescription)
          : null,
      includedItemsSummary:
        parsed.data.itemType === "COMBO"
          ? normalizeOptionalText(parsed.data.includedItemsSummary)
          : null,
      isAvailable: parsed.data.isAvailable,
      isFeatured: parsed.data.isFeatured,
      sortOrder: parsed.data.sortOrder,
      preparationTimeMins: parsed.data.preparationTimeMins ?? null,
    };

    const item = parsed.data.id
      ? await prisma.foodItem.update({
          where: { id: parsed.data.id },
          data: foodItemData,
        })
      : await prisma.foodItem.create({
          data: foodItemData,
        });

    revalidateCloudKitchenPaths();
    revalidatePath(`/food/menu/${item.slug}`);

    return {
      success: true,
      data: { id: item.id },
      message: parsed.data.id ? "Food item updated." : "Food item created.",
    };
  } catch (error) {
    return buildCloudKitchenError(error, "Unable to save the food item.");
  }
}

export async function deleteFoodItemAction(id: string): Promise<ActionResponse> {
  await requireAdmin();

  try {
    await prisma.foodItem.delete({
      where: { id },
    });

    revalidateCloudKitchenPaths();

    return {
      success: true,
      message: "Food item deleted.",
    };
  } catch {
    return {
      success: false,
      error: "This food item cannot be deleted because it is linked to an order.",
    };
  }
}

export async function upsertDeliveryZoneAction(
  input: DeliveryZoneInput,
): Promise<ActionResponse<{ id: string }>> {
  await requireAdmin();
  const parsed = deliveryZoneSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the delivery zone and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const zone = parsed.data.id
      ? await prisma.deliveryZone.update({
          where: { id: parsed.data.id },
          data: {
            kitchenId: parsed.data.kitchenId,
            name: parsed.data.name,
            description: normalizeOptionalText(parsed.data.description),
            zoneType: parsed.data.zoneType,
            centerLatitude: parsed.data.centerLatitude ?? null,
            centerLongitude: parsed.data.centerLongitude ?? null,
            radiusKm: parsed.data.radiusKm ?? null,
            polygonCoordinates: parsed.data.polygonCoordinates,
            deliveryFee: parsed.data.deliveryFee ?? null,
            minimumOrderAmount: parsed.data.minimumOrderAmount ?? null,
            freeDeliveryMinimum: parsed.data.freeDeliveryMinimum ?? null,
            isActive: parsed.data.isActive,
            sortOrder: parsed.data.sortOrder,
          },
        })
      : await prisma.deliveryZone.create({
          data: {
            kitchenId: parsed.data.kitchenId,
            name: parsed.data.name,
            description: normalizeOptionalText(parsed.data.description),
            zoneType: parsed.data.zoneType,
            centerLatitude: parsed.data.centerLatitude ?? null,
            centerLongitude: parsed.data.centerLongitude ?? null,
            radiusKm: parsed.data.radiusKm ?? null,
            polygonCoordinates: parsed.data.polygonCoordinates,
            deliveryFee: parsed.data.deliveryFee ?? null,
            minimumOrderAmount: parsed.data.minimumOrderAmount ?? null,
            freeDeliveryMinimum: parsed.data.freeDeliveryMinimum ?? null,
            isActive: parsed.data.isActive,
            sortOrder: parsed.data.sortOrder,
          },
        });

    revalidateCloudKitchenPaths();

    return {
      success: true,
      data: { id: zone.id },
      message: parsed.data.id ? "Delivery zone updated." : "Delivery zone created.",
    };
  } catch (error) {
    return buildCloudKitchenError(error, "Unable to save the delivery zone.");
  }
}

export async function deleteDeliveryZoneAction(id: string): Promise<ActionResponse> {
  await requireAdmin();

  try {
    await prisma.deliveryZone.delete({
      where: { id },
    });

    revalidateCloudKitchenPaths();

    return {
      success: true,
      message: "Delivery zone deleted.",
    };
  } catch {
    return {
      success: false,
      error: "This delivery zone cannot be deleted because it is linked to food orders.",
    };
  }
}

export async function placeFoodOrderAction(
  input: FoodOrderInput,
): Promise<ActionResponse<{ orderId: string; orderNumber: string }>> {
  const user = await requireRetailUser();
  const parsed = foodOrderSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review your food order details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const requestedFoodItemIds = [...new Set(parsed.data.items.map((item) => item.foodItemId))];

    const items = await prisma.foodItem.findMany({
      where: {
        id: {
          in: requestedFoodItemIds,
        },
        kitchenId: parsed.data.kitchenId,
        isAvailable: true,
        kitchen: {
          isActive: true,
          acceptsOrders: true,
        },
      },
      include: {
        foodCategory: {
          select: {
            name: true,
          },
        },
      },
    });

    if (items.length !== requestedFoodItemIds.length) {
      return {
        success: false,
        error: "One or more food items are no longer available.",
      };
    }

    const itemsById = new Map(items.map((item) => [item.id, item]));
    const subtotal = parsed.data.items.reduce((sum, item) => {
      const foodItem = itemsById.get(item.foodItemId);
      return foodItem ? sum + Number(foodItem.price) * item.quantity : sum;
    }, 0);

    const kitchen = await prisma.kitchen.findFirst({
      where: {
        id: parsed.data.kitchenId,
        isActive: true,
        acceptsOrders: true,
      },
    });

    if (!kitchen) {
      return {
        success: false,
        error: "The selected kitchen is not accepting orders right now.",
      };
    }

    let address;
    let deliveryZoneId: string | null = null;
    let deliveryZoneName: string | null = null;
    let distanceKm: number | null = null;
    let deliveryFee = 0;

    if (parsed.data.fulfillmentType === "DELIVERY") {
      const eligibility = await resolveDeliveryEligibility({
        location: {
          latitude: parsed.data.deliveryAddress.latitude,
          longitude: parsed.data.deliveryAddress.longitude,
        },
        subtotal,
      });

      if (!eligibility.eligible) {
        return {
          success: false,
          error: eligibility.message,
        };
      }

      if (eligibility.kitchen.id !== parsed.data.kitchenId) {
        return {
          success: false,
          error: `Your selected address is served by ${eligibility.kitchen.name}. Please refresh the menu for that kitchen.`,
        };
      }

      if (subtotal < eligibility.minimumOrderAmount) {
        return {
          success: false,
          error: `The minimum order for this delivery area is ${eligibility.minimumOrderAmount.toFixed(2)}.`,
        };
      }

      address = await persistDeliveryAddress(
        user.id,
        {
          ...parsed.data.deliveryAddress,
          recipientName: parsed.data.deliveryAddress.recipientName,
          phone: parsed.data.deliveryAddress.phone,
          isDefault: false,
        },
        parsed.data.saveAddressForLater,
      );

      deliveryZoneId = eligibility.deliveryZone?.id ?? null;
      deliveryZoneName = eligibility.deliveryZone?.name ?? null;
      distanceKm = eligibility.distanceKm;
      deliveryFee = eligibility.deliveryFee;
    } else {
      const formattedAddress = [
        kitchen.addressLine1,
        kitchen.addressLine2,
        kitchen.city,
        kitchen.state,
        kitchen.postalCode,
        kitchen.country,
      ]
        .filter(Boolean)
        .join(", ");

      address = await prisma.deliveryAddress.create({
        data: {
          userId: null,
          label: "Pickup",
          recipientName: parsed.data.deliveryAddress.recipientName,
          phone: parsed.data.deliveryAddress.phone,
          line1: kitchen.addressLine1,
          line2: normalizeOptionalText(kitchen.addressLine2),
          city: kitchen.city,
          state: kitchen.state,
          postalCode: kitchen.postalCode,
          country: kitchen.country,
          formattedAddress,
          placeId: null,
          latitude: Number(kitchen.latitude),
          longitude: Number(kitchen.longitude),
          deliveryInstructions: normalizeOptionalText(parsed.data.deliveryAddress.deliveryInstructions),
          isDefault: false,
        },
      });
    }

    const orderNumber = generateOrderNumber("food");
    const itemCount = parsed.data.items.reduce((sum, item) => sum + item.quantity, 0);
    const total = subtotal + deliveryFee;

    const order = await prisma.foodOrder.create({
      data: {
        orderNumber,
        userId: user.id,
        kitchenId: parsed.data.kitchenId,
        fulfillmentType: parsed.data.fulfillmentType,
        deliveryAddressId: address.id,
        deliveryZoneId,
        status: "PENDING",
        customerName: user.name ?? parsed.data.deliveryAddress.recipientName,
        customerEmail: user.email ?? "",
        customerPhone: address.phone,
        notes: normalizeOptionalText(parsed.data.notes),
        subtotal,
        deliveryFee,
        total,
        itemCount,
        distanceKm,
        items: {
          create: parsed.data.items.map((entry) => {
            const item = itemsById.get(entry.foodItemId);

            if (!item) {
              throw new Error("A selected food item is no longer available.");
            }

            return {
              foodItemId: item.id,
              foodItemName: item.name,
              foodItemSlug: item.slug,
              foodCategoryName: item.foodCategory.name,
              quantity: entry.quantity,
              unitPrice: item.price,
              lineTotal: Number(item.price) * entry.quantity,
              selectedOptions: entry.selectedOptions,
            };
          }),
        },
      },
    });

    await setFoodLocationSession({
      kitchenId: kitchen.id,
      kitchenName: kitchen.name,
      fulfillmentType: parsed.data.fulfillmentType,
      deliveryZoneId,
      deliveryZoneName,
      distanceKm,
      checkedAt: new Date().toISOString(),
      address: {
        label:
          parsed.data.fulfillmentType === "PICKUP"
            ? "Pickup"
            : normalizeOptionalText(parsed.data.deliveryAddress.label),
        line1: address.line1,
        line2: normalizeOptionalText(address.line2),
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        formattedAddress: address.formattedAddress,
        placeId: normalizeOptionalText(address.placeId),
        latitude: Number(address.latitude),
        longitude: Number(address.longitude),
        deliveryInstructions: normalizeOptionalText(address.deliveryInstructions),
      },
    });

    revalidateCloudKitchenPaths();
    revalidatePath(`/account/food-orders/${order.id}`);

    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      message:
        parsed.data.fulfillmentType === "PICKUP"
          ? "Pickup order placed successfully."
          : "Food order placed successfully.",
    };
  } catch (error) {
    return buildCloudKitchenError(error, "Unable to place the food order right now.");
  }
}

export async function updateFoodOrderStatusAction(input: {
  id: string;
  status: string;
}): Promise<ActionResponse> {
  await requireAdmin();
  const parsed = foodOrderStatusSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please choose a valid food order status.",
    };
  }

  await prisma.foodOrder.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status,
    },
  });

  revalidateCloudKitchenPaths();
  revalidatePath(`/admin/cloud-kitchen/orders/${parsed.data.id}`);
  revalidatePath(`/account/food-orders/${parsed.data.id}`);

  return {
    success: true,
    message: "Food order status updated.",
  };
}










