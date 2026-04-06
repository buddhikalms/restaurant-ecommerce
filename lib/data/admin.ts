import { format } from "date-fns";
import { unstable_noStore as noStore } from "next/cache";
import { type Prisma, type Role } from "@/generated/prisma";

import { ADMIN_PAGE_SIZE, ORDER_STATUSES } from "@/lib/constants";
import { coerceGalleryImageUrls } from "@/lib/product-gallery";
import { calculatePriceWithVat } from "@/lib/product-pricing";
import { prisma } from "@/lib/prisma";

type AdminProductFilters = {
  query?: string;
  status?: "active" | "inactive";
  page?: number;
  pageSize?: number;
};

type AdminOrderFilters = {
  query?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

type AdminCustomerFilters = {
  query?: string;
  role?: "CUSTOMER" | "WHOLESALE_CUSTOMER";
  page?: number;
  pageSize?: number;
};

function getDateDaysAgo(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

function buildTrend(currentValue: number, previousValue: number) {
  const delta = currentValue - previousValue;

  return {
    direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
    value:
      previousValue === 0
        ? currentValue === 0
          ? 0
          : 100
        : Math.round(Math.abs((delta / previousValue) * 100)),
    label: "vs previous 30d",
  } as const;
}

function buildPagination(totalItems: number, requestedPage = 1, pageSize = ADMIN_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(requestedPage, 1), totalPages);

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    skip: (page - 1) * pageSize,
  };
}

export async function getAdminMetrics() {
  noStore();

  const currentPeriodStart = getDateDaysAgo(29);
  const previousPeriodStart = getDateDaysAgo(59);

  const [
    totalProducts,
    totalOrders,
    totalRetailCustomers,
    totalWholesaleCustomers,
    totalRevenueAggregation,
    pendingRevenueAggregation,
    pendingOrders,
    currentRevenueAggregation,
    previousRevenueAggregation,
    currentOrdersCount,
    previousOrdersCount,
    currentCustomersCount,
    previousCustomersCount,
    currentProductsCount,
    previousProductsCount,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "WHOLESALE_CUSTOMER" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PENDING", "CONFIRMED", "PROCESSING"] } },
    }),
    prisma.order.count({
      where: { status: { in: ["PENDING", "CONFIRMED", "PROCESSING"] } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { not: "CANCELLED" },
        createdAt: { gte: currentPeriodStart },
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { not: "CANCELLED" },
        createdAt: { gte: previousPeriodStart, lt: currentPeriodStart },
      },
    }),
    prisma.order.count({ where: { createdAt: { gte: currentPeriodStart } } }),
    prisma.order.count({
      where: { createdAt: { gte: previousPeriodStart, lt: currentPeriodStart } },
    }),
    prisma.user.count({
      where: {
        role: { in: ["CUSTOMER", "WHOLESALE_CUSTOMER"] },
        createdAt: { gte: currentPeriodStart },
      },
    }),
    prisma.user.count({
      where: {
        role: { in: ["CUSTOMER", "WHOLESALE_CUSTOMER"] },
        createdAt: { gte: previousPeriodStart, lt: currentPeriodStart },
      },
    }),
    prisma.product.count({ where: { createdAt: { gte: currentPeriodStart } } }),
    prisma.product.count({
      where: { createdAt: { gte: previousPeriodStart, lt: currentPeriodStart } },
    }),
  ]);

  const revenueSummary = toNumber(totalRevenueAggregation._sum.total);
  const pendingRevenue = toNumber(pendingRevenueAggregation._sum.total);
  const totalCustomers = totalRetailCustomers + totalWholesaleCustomers;

  return {
    totalProducts,
    totalOrders,
    totalCustomers,
    totalRetailCustomers,
    totalWholesaleCustomers,
    revenueSummary,
    pendingRevenue,
    pendingOrders,
    stats: [
      {
        label: "Revenue",
        value: revenueSummary,
        emphasizeCurrency: true,
        trend: buildTrend(
          toNumber(currentRevenueAggregation._sum.total),
          toNumber(previousRevenueAggregation._sum.total),
        ),
      },
      {
        label: "Orders",
        value: totalOrders,
        trend: buildTrend(currentOrdersCount, previousOrdersCount),
      },
      {
        label: "Customers",
        value: totalCustomers,
        trend: buildTrend(currentCustomersCount, previousCustomersCount),
      },
      {
        label: "Products",
        value: totalProducts,
        trend: buildTrend(currentProductsCount, previousProductsCount),
      },
    ],
  };
}

export async function getAdminProducts(filters: AdminProductFilters) {
  noStore();

  const where: Prisma.ProductWhereInput = {
    ...(filters.query
      ? {
          OR: [
            { name: { contains: filters.query } },
            { sku: { contains: filters.query } },
            {
              variants: {
                some: {
                  OR: [
                    { name: { contains: filters.query } },
                    { sku: { contains: filters.query } },
                  ],
                },
              },
            },
          ],
        }
      : {}),
    ...(filters.status === "active"
      ? { isActive: true }
      : filters.status === "inactive"
        ? { isActive: false }
        : {}),
  };

  const totalItems = await prisma.product.count({ where });
  const pagination = buildPagination(totalItems, filters.page, filters.pageSize);

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      variants: {
        where: { isActive: true },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: pagination.skip,
    take: pagination.pageSize,
  });

  return {
    items: products.map((product) => {
      const vatRate = Number(product.vatRate);

      return {
        ...product,
        vatRate,
        normalPrice: calculatePriceWithVat(product.normalPrice, vatRate, product.vatMode),
        wholesalePrice: calculatePriceWithVat(
          product.wholesalePrice,
          vatRate,
          product.vatMode,
        ),
      };
    }),
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalItems: pagination.totalItems,
    totalPages: pagination.totalPages,
  };
}

export async function getAdminProductById(id: string) {
  noStore();

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!product) {
    return null;
  }

  return {
    ...product,
    galleryImageUrls: coerceGalleryImageUrls(product.galleryImageUrls),
    vatRate: Number(product.vatRate),
    normalPrice: Number(product.normalPrice),
    wholesalePrice: Number(product.wholesalePrice),
    variants: product.variants.map((variant) => ({
      ...variant,
      normalPrice: Number(variant.normalPrice),
      wholesalePrice: Number(variant.wholesalePrice),
    })),
  };
}

export async function getAdminCategories() {
  noStore();

  return prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getAdminOrders(filters: AdminOrderFilters) {
  noStore();

  const where: Prisma.OrderWhereInput = {
    ...(filters.status ? { status: filters.status as never } : {}),
    ...(filters.query
      ? {
          OR: [
            { orderNumber: { contains: filters.query } },
            { user: { email: { contains: filters.query } } },
            { user: { businessName: { contains: filters.query } } },
            { user: { name: { contains: filters.query } } },
          ],
        }
      : {}),
  };

  const totalItems = await prisma.order.count({ where });
  const pagination = buildPagination(totalItems, filters.page, filters.pageSize);

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          email: true,
          businessName: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: pagination.skip,
    take: pagination.pageSize,
  });

  return {
    items: orders.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      total: Number(order.total),
    })),
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalItems: pagination.totalItems,
    totalPages: pagination.totalPages,
  };
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
          role: true,
        },
      },
      shippingAddress: true,
      shippingZone: {
        select: {
          id: true,
          name: true,
        },
      },
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!order) {
    return null;
  }

  return {
    ...order,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    handlingFee: Number(order.handlingFee),
    codFee: Number(order.codFee),
    total: Number(order.total),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
    })),
  };
}

export async function getAdminCustomers(filters: AdminCustomerFilters) {
  noStore();

  const roles: Role[] = filters.role
    ? [filters.role]
    : ["CUSTOMER", "WHOLESALE_CUSTOMER"];

  const where: Prisma.UserWhereInput = {
    role: {
      in: roles,
    },
    ...(filters.query
      ? {
          OR: [
            { name: { contains: filters.query } },
            { email: { contains: filters.query } },
            { businessName: { contains: filters.query } },
            { phone: { contains: filters.query } },
          ],
        }
      : {}),
  };

  const totalItems = await prisma.user.count({ where });
  const pagination = buildPagination(totalItems, filters.page, filters.pageSize);

  const customers = await prisma.user.findMany({
    where,
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
    orderBy: [{ role: "desc" }, { createdAt: "desc" }],
    skip: pagination.skip,
    take: pagination.pageSize,
  });

  const spendByUser = customers.length
    ? await prisma.order.groupBy({
        by: ["userId"],
        where: {
          userId: {
            in: customers.map((customer) => customer.id),
          },
          status: {
            not: "CANCELLED",
          },
        },
        _count: { _all: true },
        _sum: { total: true },
      })
    : [];

  const spendLookup = new Map(
    spendByUser.map((entry) => [
      entry.userId,
      {
        orderCount: entry._count._all,
        totalSpent: toNumber(entry._sum.total),
      },
    ]),
  );

  return {
    items: customers.map((customer) => ({
      ...customer,
      orderCount: spendLookup.get(customer.id)?.orderCount ?? 0,
      totalSpent: spendLookup.get(customer.id)?.totalSpent ?? 0,
      orders: customer.orders.map((order) => ({
        ...order,
        subtotal: Number(order.subtotal),
        total: Number(order.total),
      })),
    })),
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalItems: pagination.totalItems,
    totalPages: pagination.totalPages,
  };
}

export async function getAdminAnalytics() {
  noStore();

  const sevenDayStart = getDateDaysAgo(6);

  const [
    metrics,
    statusGroups,
    recentOrders,
    categories,
    completedOrders,
    totalActiveOrders,
    wholesaleCustomers,
    retailCustomers,
    wholesaleOrders,
    retailOrders,
    wholesaleRevenue,
    retailRevenue,
  ] = await Promise.all([
    getAdminMetrics(),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      where: {
        status: { not: "CANCELLED" },
        createdAt: { gte: sevenDayStart },
      },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.user.count({ where: { role: "WHOLESALE_CUSTOMER" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.count({ where: { user: { role: "WHOLESALE_CUSTOMER" } } }),
    prisma.order.count({ where: { user: { role: "CUSTOMER" } } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { not: "CANCELLED" },
        user: { role: "WHOLESALE_CUSTOMER" },
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { not: "CANCELLED" },
        user: { role: "CUSTOMER" },
      },
    }),
  ]);

  const dailyLookup = new Map<string, { label: string; revenue: number; orders: number }>(
    Array.from({ length: 7 }, (_, index) => {
      const date = new Date(sevenDayStart);
      date.setDate(sevenDayStart.getDate() + index);
      const key = format(date, "yyyy-MM-dd");

      return [
        key,
        {
          label: format(date, "EEE"),
          revenue: 0,
          orders: 0,
        },
      ];
    }),
  );

  recentOrders.forEach((order) => {
    const key = format(order.createdAt, "yyyy-MM-dd");
    const entry = dailyLookup.get(key);

    if (!entry) {
      return;
    }

    entry.revenue += toNumber(order.total);
    entry.orders += 1;
  });

  return {
    metrics,
    averageOrderValue:
      metrics.totalOrders > 0 ? metrics.revenueSummary / metrics.totalOrders : 0,
    completionRate:
      totalActiveOrders > 0
        ? Math.round((completedOrders / totalActiveOrders) * 100)
        : 0,
    wholesaleShare:
      wholesaleOrders + retailOrders > 0
        ? Math.round((wholesaleOrders / (wholesaleOrders + retailOrders)) * 100)
        : 0,
    statusBreakdown: ORDER_STATUSES.map((status) => {
      const currentStatus = statusGroups.find((entry) => entry.status === status);

      return {
        status,
        count: currentStatus?._count._all ?? 0,
        revenue: toNumber(currentStatus?._sum.total),
      };
    }),
    dailyRevenue: Array.from(dailyLookup.values()),
    topCategories: categories
      .sort((left, right) => right._count.products - left._count.products)
      .slice(0, 5)
      .map((category) => ({
        id: category.id,
        name: category.name,
        productCount: category._count.products,
        isActive: category.isActive,
      })),
    customerMix: [
      {
        label: "Wholesale customers",
        count: wholesaleCustomers,
      },
      {
        label: "Retail customers",
        count: retailCustomers,
      },
    ],
    orderMix: [
      {
        label: "Wholesale orders",
        count: wholesaleOrders,
        revenue: toNumber(wholesaleRevenue._sum.total),
      },
      {
        label: "Retail orders",
        count: retailOrders,
        revenue: toNumber(retailRevenue._sum.total),
      },
    ],
  };
}




