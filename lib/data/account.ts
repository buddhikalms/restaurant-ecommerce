import { unstable_noStore as noStore } from "next/cache";

import { prisma } from "@/lib/prisma";
import { type PricingMode } from "@/lib/user-roles";

export type ReorderCartItem = {
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  variantName: string | null;
  sku: string;
  imageUrl: string;
  unitPrice: number;
  minimumQuantity: number;
  stockQuantity: number;
  categoryName: string;
  pricingMode: PricingMode;
  quantity: number;
};

function mapDefaultAddress(address?: {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
} | null) {
  if (!address) {
    return null;
  }

  return {
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country
  };
}

function buildReorderCartItem(
  item: {
    productId: string;
    productSku: string;
    quantity: number;
    productName: string;
    product: {
      id: string;
      slug: string;
      name: string;
      sku: string;
      imageUrl: string;
      isActive: boolean;
      productType: "SIMPLE" | "VARIABLE";
      normalPrice: { toString(): string };
      wholesalePrice: { toString(): string };
      minOrderQuantity: number;
      stockQuantity: number;
      category: {
        name: string;
      };
      variants: Array<{
        id: string;
        name: string;
        sku: string;
        normalPrice: { toString(): string };
        wholesalePrice: { toString(): string };
        minOrderQuantity: number;
        stockQuantity: number;
      }>;
    };
  },
  pricingMode: PricingMode
): ReorderCartItem | null {
  const product = item.product;

  if (!product.isActive) {
    return null;
  }

  if (product.productType === "VARIABLE") {
    const variant = product.variants.find((entry) => entry.sku === item.productSku);

    if (!variant) {
      return null;
    }

    const minimumQuantity = pricingMode === "wholesale" ? variant.minOrderQuantity : 1;

    if (variant.stockQuantity < minimumQuantity) {
      return null;
    }

    return {
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      name: product.name,
      variantName: variant.name,
      sku: variant.sku,
      imageUrl: product.imageUrl,
      unitPrice: Number(pricingMode === "wholesale" ? variant.wholesalePrice : variant.normalPrice),
      minimumQuantity,
      stockQuantity: variant.stockQuantity,
      categoryName: product.category.name,
      pricingMode,
      quantity: Math.min(variant.stockQuantity, Math.max(minimumQuantity, item.quantity))
    };
  }

  const minimumQuantity = pricingMode === "wholesale" ? product.minOrderQuantity : 1;

  if (product.stockQuantity < minimumQuantity) {
    return null;
  }

  return {
    productId: product.id,
    variantId: null,
    slug: product.slug,
    name: product.name,
    variantName: null,
    sku: product.sku,
    imageUrl: product.imageUrl,
    unitPrice: Number(pricingMode === "wholesale" ? product.wholesalePrice : product.normalPrice),
    minimumQuantity,
    stockQuantity: product.stockQuantity,
    categoryName: product.category.name,
    pricingMode,
    quantity: Math.min(product.stockQuantity, Math.max(minimumQuantity, item.quantity))
  };
}

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

export async function getAccountSettings(userId: string) {
  noStore();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      name: true,
      email: true,
      phone: true,
      businessName: true,
      addresses: {
        where: {
          isDefault: true
        },
        orderBy: {
          updatedAt: "desc"
        },
        take: 1,
        select: {
          line1: true,
          line2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true
        }
      },
      wholesaleProfile: {
        select: {
          firstName: true,
          lastName: true,
          mobileNumber: true,
          telephoneNumber: true,
          tradingName: true,
          deliveryAddressLine1: true,
          deliveryAddressLine2: true,
          deliveryAddressLine3: true,
          deliveryTown: true,
          deliveryPostcode: true,
          differentInvoiceAddress: true,
          invoiceAddressLine1: true,
          invoiceAddressLine2: true,
          invoiceAddressLine3: true,
          invoiceTown: true,
          invoicePostcode: true,
          companyType: true,
          companyNumber: true,
          directorName: true,
          businessType: true
        }
      }
    }
  });

  if (!user) {
    return null;
  }

  const defaultAddress = mapDefaultAddress(user.addresses[0]);

  return {
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    phone: user.phone,
    businessName: user.businessName,
    wholesaleProfile: user.wholesaleProfile,
    defaultAddress
  };
}

export async function getCheckoutCustomerDefaults(userId: string) {
  noStore();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      phone: true,
      businessName: true,
      addresses: {
        where: {
          isDefault: true
        },
        orderBy: {
          updatedAt: "desc"
        },
        take: 1,
        select: {
          line1: true,
          line2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true
        }
      }
    }
  });

  const defaultAddress = mapDefaultAddress(user?.addresses[0]);

  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    businessName: user?.businessName ?? "",
    line1: defaultAddress?.line1 ?? "",
    line2: defaultAddress?.line2 ?? "",
    city: defaultAddress?.city ?? "",
    state: defaultAddress?.state ?? "",
    postalCode: defaultAddress?.postalCode ?? "",
    country: defaultAddress?.country ?? "USA"
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

export async function getCustomerOrderById(userId: string, orderId: string, pricingMode: PricingMode) {
  noStore();

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId
    },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              sku: true,
              imageUrl: true,
              isActive: true,
              productType: true,
              normalPrice: true,
              wholesalePrice: true,
              minOrderQuantity: true,
              stockQuantity: true,
              category: {
                select: {
                  name: true
                }
              },
              variants: {
                where: {
                  isActive: true
                },
                orderBy: {
                  position: "asc"
                },
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  normalPrice: true,
                  wholesalePrice: true,
                  minOrderQuantity: true,
                  stockQuantity: true
                }
              }
            }
          }
        }
      },
      shippingAddress: true
    }
  });

  if (!order) {
    return null;
  }

  const reorderItems = order.items
    .map((item) => buildReorderCartItem(item, pricingMode))
    .filter((item): item is ReorderCartItem => Boolean(item));

  const unavailableReorderItems = order.items
    .filter((item) => !buildReorderCartItem(item, pricingMode))
    .map((item) => item.productName);

  return {
    ...order,
    subtotal: Number(order.subtotal),
    total: Number(order.total),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal)
    })),
    reorderItems,
    unavailableReorderItems
  };
}



