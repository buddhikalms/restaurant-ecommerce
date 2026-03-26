import { unstable_noStore as noStore } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function getAccountOverview(userId: string) {
  noStore();

  const [user, totalOrders, pendingOrders, recentOrders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        businessName: true,
        createdAt: true
      }
    }),
    prisma.order.count({ where: { userId } }),
    prisma.order.count({
      where: {
        userId,
        status: {
          in: ["PENDING", "CONFIRMED", "PROCESSING"]
        }
      }
    }),
    prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        itemCount: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
      take: 3
    })
  ]);

  return {
    user,
    totalOrders,
    pendingOrders,
    recentOrders: recentOrders.map((order) => ({
      ...order,
      total: Number(order.total)
    }))
  };
}

export async function getCustomerOrders(userId: string) {
  noStore();

  const orders = await prisma.order.findMany({
    where: { userId },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      subtotal: true,
      itemCount: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });

  return orders.map((order) => ({
    ...order,
    total: Number(order.total),
    subtotal: Number(order.subtotal)
  }));
}

export async function getCustomerOrderById(userId: string, orderId: string) {
  noStore();

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId
    },
    include: {
      items: {
        orderBy: { createdAt: "asc" }
      },
      shippingAddress: true
    }
  });

  if (!order) {
    return null;
  }

  return {
    ...order,
    subtotal: Number(order.subtotal),
    total: Number(order.total),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal)
    }))
  };
}