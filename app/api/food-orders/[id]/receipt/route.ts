import { auth } from "@/auth";
import { getCustomerFoodOrderById } from "@/lib/data/cloud-kitchen";
import {
  buildFoodOrderReceiptHtml,
  getFoodOrderReceiptFilename,
} from "@/lib/food-order-receipt";
import { isCustomerRole } from "@/lib/user-roles";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await auth();
  const user = session?.user;

  if (!user || !isCustomerRole(user.role)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const order = await getCustomerFoodOrderById(user.id, id);

  if (!order || !order.deliveryAddress) {
    return new Response("Food order not found", { status: 404 });
  }

  const html = buildFoodOrderReceiptHtml({
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    itemCount: order.itemCount,
    fulfillmentType: order.fulfillmentType,
    kitchenName: order.kitchen?.name ?? "Cloud kitchen",
    customer: {
      name: user.name ?? order.customerName,
      email: user.email,
      phone: order.customerPhone,
    },
    address: {
      recipientName: order.deliveryAddress.recipientName,
      line1: order.deliveryAddress.line1,
      line2: order.deliveryAddress.line2,
      city: order.deliveryAddress.city,
      state: order.deliveryAddress.state,
      postalCode: order.deliveryAddress.postalCode,
      country: order.deliveryAddress.country,
      phone: order.deliveryAddress.phone,
      deliveryInstructions: order.deliveryAddress.deliveryInstructions,
    },
    items:
      order.items?.map((item) => ({
        foodItemName: item.foodItemName,
        foodItemSlug: item.foodItemSlug,
        foodCategoryName: item.foodCategoryName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        selectedOptions: Array.isArray(item.selectedOptions)
          ? item.selectedOptions.filter(
              (entry): entry is string => typeof entry === "string",
            )
          : [],
      })) ?? [],
    notes: order.notes,
  });

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${getFoodOrderReceiptFilename(order.orderNumber)}"`,
      "Cache-Control": "no-store",
    },
  });
}
