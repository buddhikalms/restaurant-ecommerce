import { auth } from "@/auth";
import { getCustomerOrderById } from "@/lib/data/account";
import { buildOrderReceiptHtml, getOrderReceiptFilename } from "@/lib/order-receipt";
import { getPricingModeForRole, isCustomerRole } from "@/lib/user-roles";

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
  const pricingMode = getPricingModeForRole(user.role);
  const order = await getCustomerOrderById(user.id, id, pricingMode);

  if (!order) {
    return new Response("Order not found", { status: 404 });
  }

  const html = buildOrderReceiptHtml({
    pricingMode,
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    subtotal: order.subtotal,
    total: order.total,
    itemCount: order.itemCount,
    customer: {
      name: user.name ?? order.shippingAddress.contactName,
      email: user.email,
      businessName: user.businessName ?? order.shippingAddress.businessName,
    },
    shippingAddress: {
      contactName: order.shippingAddress.contactName,
      businessName: order.shippingAddress.businessName,
      line1: order.shippingAddress.line1,
      line2: order.shippingAddress.line2,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      postalCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
      phone: order.shippingAddress.phone,
    },
    items: order.items.map((item) => ({
      productName: item.productName,
      productSku: item.productSku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
    notes: order.notes,
  });

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${getOrderReceiptFilename(order.orderNumber)}"`,
      "Cache-Control": "no-store",
    },
  });
}
