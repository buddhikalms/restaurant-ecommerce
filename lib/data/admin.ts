import { unstable_noStore as noStore } from "next/cache";

import { coerceGalleryImageUrls } from "@/lib/product-gallery";
import { prisma } from "@/lib/prisma";

type AdminProductFilters = {
  query?: string;
};

type AdminOrderFilters = {
  query?: string;
  status?: string;
};

export async function getAdminMetrics() {
  noStore();

  const [
    totalProducts,
    totalOrders,
    totalRetailCustomers,
    totalWholesaleCustomers,
    orderAggregation,
    pendingAggregation
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({
      where: {
        role: "CUSTOMER"
      }
    }),
    prisma.user.count({
      where: {
        role: "WHOLESALE_CUSTOMER"
      }
    }),
    prisma.order.aggregate({
      _sum: {
        total: true
      },
      where: {
        status: {
          not: "CANCELLED"
        }
      }
    }),
    prisma.order.aggregate({
      _sum: {
        total: true
      },
      where: {
        status: {
          in: ["PENDING", "CONFIRMED", "PROCESSING"]
        }
      }
    })
  ]);

  return {
    totalProducts,
    totalOrders,
    totalCustomers: totalRetailCustomers + totalWholesaleCustomers,
    totalRetailCustomers,
    totalWholesaleCustomers,
    revenueSummary: Number(orderAggregation._sum.total ?? 0),
    pendingRevenue: Number(pendingAggregation._sum.total ?? 0)
  };
}

export async function getAdminProducts(filters: AdminProductFilters) {
  noStore();

  const products = await prisma.product.findMany({
    where: filters.query
      ? {
          OR: [
            { name: { contains: filters.query } },
            { sku: { contains: filters.query } },
            {
              variants: {
                some: {
                  OR: [
                    { name: { contains: filters.query } },
                    { sku: { contains: filters.query } }
                  ]
                }
              }
            }
          ]
        }
      : undefined,
    include: {
      category: true,
      variants: {
        where: { isActive: true },
        select: { id: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return products.map((product) => ({
    ...product,
    normalPrice: Number(product.normalPrice),
    wholesalePrice: Number(product.wholesalePrice)
  }));
}

export async function getAdminProductById(id: string) {
  noStore();

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: {
        orderBy: { position: "asc" }
      }
    }
  });

  if (!product) {
    return null;
  }

  return {
    ...product,
    galleryImageUrls: coerceGalleryImageUrls(product.galleryImageUrls),
    normalPrice: Number(product.normalPrice),
    wholesalePrice: Number(product.wholesalePrice),
    variants: product.variants.map((variant) => ({
      ...variant,
      normalPrice: Number(variant.normalPrice),
      wholesalePrice: Number(variant.wholesalePrice)
    }))
  };
}

export async function getAdminCategories() {
  noStore();

  return prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true
        }
      }
    },
    orderBy: { name: "asc" }
  });
}

export async function getAdminOrders(filters: AdminOrderFilters) {
  noStore();

  const orders = await prisma.order.findMany({
    where: {
      ...(filters.status ? { status: filters.status as never } : {}),
      ...(filters.query
        ? {
            OR: [
              { orderNumber: { contains: filters.query } },
              { user: { email: { contains: filters.query } } },
              { user: { businessName: { contains: filters.query } } },
              { user: { name: { contains: filters.query } } }
            ]
          }
        : {})
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          businessName: true,
          role: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return orders.map((order) => ({
    ...order,
    subtotal: Number(order.subtotal),
    total: Number(order.total)
  }));
}

export async function getAdminOrderById(id: string) {
  noStore();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          businessName: true,
          role: true
        }
      },
      shippingAddress: true,
      items: {
        orderBy: { createdAt: "asc" }
      }
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

export async function getAdminCustomers() {
  noStore();

  const customers = await prisma.user.findMany({
    where: {
      role: {
        in: ["CUSTOMER", "WHOLESALE_CUSTOMER"]
      }
    },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5
      }
    },
    orderBy: [{ role: "desc" }, { createdAt: "desc" }]
  });

  return customers.map((customer) => ({
    ...customer,
    orders: customer.orders.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      total: Number(order.total)
    }))
  }));
}