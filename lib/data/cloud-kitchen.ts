import { unstable_noStore as noStore } from "next/cache";

import {
  CLOUD_KITCHEN_SERVICE_DEFAULTS,
  DEFAULT_CLOUD_KITCHEN_LOCATION,
  DEFAULT_CLOUD_KITCHEN_NAME,
  DEFAULT_CLOUD_KITCHEN_SLUG,
  DEFAULT_FOOD_CATEGORY_NAME,
  DEFAULT_FOOD_CATEGORY_SLUG,
} from "@/lib/cloud-kitchen/defaults";
import { prisma } from "@/lib/prisma";

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

export async function ensureDefaultKitchen() {
  return prisma.kitchen.upsert({
    where: {
      slug: DEFAULT_CLOUD_KITCHEN_SLUG,
    },
    update: {
      name: DEFAULT_CLOUD_KITCHEN_NAME,
      description: `Freshly prepared meals delivered in ${CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryTimeMinMins} to ${CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryTimeMaxMins} minutes.`,
      addressLine1: DEFAULT_CLOUD_KITCHEN_LOCATION.addressLine1,
      city: DEFAULT_CLOUD_KITCHEN_LOCATION.city,
      state: DEFAULT_CLOUD_KITCHEN_LOCATION.state,
      postalCode: DEFAULT_CLOUD_KITCHEN_LOCATION.postalCode,
      country: DEFAULT_CLOUD_KITCHEN_LOCATION.country,
      latitude: DEFAULT_CLOUD_KITCHEN_LOCATION.latitude,
      longitude: DEFAULT_CLOUD_KITCHEN_LOCATION.longitude,
      maxDeliveryDistanceKm: CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryRadiusKm,
      minimumOrderAmount: 0,
      deliveryFee: CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryFee,
      freeDeliveryMinimum: null,
      preparationTimeMins: CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryTimeMinMins,
      isActive: true,
      acceptsOrders: true,
      sortOrder: 0,
    },
    create: {
      name: DEFAULT_CLOUD_KITCHEN_NAME,
      slug: DEFAULT_CLOUD_KITCHEN_SLUG,
      description: `Freshly prepared meals delivered in ${CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryTimeMinMins} to ${CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryTimeMaxMins} minutes.`,
      phone: null,
      email: null,
      addressLine1: DEFAULT_CLOUD_KITCHEN_LOCATION.addressLine1,
      addressLine2: null,
      city: DEFAULT_CLOUD_KITCHEN_LOCATION.city,
      state: DEFAULT_CLOUD_KITCHEN_LOCATION.state,
      postalCode: DEFAULT_CLOUD_KITCHEN_LOCATION.postalCode,
      country: DEFAULT_CLOUD_KITCHEN_LOCATION.country,
      latitude: DEFAULT_CLOUD_KITCHEN_LOCATION.latitude,
      longitude: DEFAULT_CLOUD_KITCHEN_LOCATION.longitude,
      maxDeliveryDistanceKm: CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryRadiusKm,
      minimumOrderAmount: 0,
      deliveryFee: CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryFee,
      freeDeliveryMinimum: null,
      preparationTimeMins: CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryTimeMinMins,
      isActive: true,
      acceptsOrders: true,
      sortOrder: 0,
    },
  });
}

export async function ensureDefaultFoodCategory() {
  return prisma.foodCategory.upsert({
    where: {
      slug: DEFAULT_FOOD_CATEGORY_SLUG,
    },
    update: {
      name: DEFAULT_FOOD_CATEGORY_NAME,
      description: "Freshly prepared meals from the cloud kitchen menu.",
      sortOrder: 0,
      isActive: true,
    },
    create: {
      name: DEFAULT_FOOD_CATEGORY_NAME,
      slug: DEFAULT_FOOD_CATEGORY_SLUG,
      description: "Freshly prepared meals from the cloud kitchen menu.",
      sortOrder: 0,
      isActive: true,
    },
  });
}

async function ensureCloudKitchenDefaults() {
  await Promise.all([ensureDefaultKitchen(), ensureDefaultFoodCategory()]);
}

async function getHomepageFoodItems() {
  const sharedQuery = {
    include: {
      kitchen: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      foodCategory: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }],
    take: 8,
  };

  const featuredItems = await prisma.foodItem.findMany({
    ...sharedQuery,
    where: {
      isFeatured: true,
      isAvailable: true,
      kitchen: {
        isActive: true,
        acceptsOrders: true,
      },
      foodCategory: {
        isActive: true,
      },
    },
  });

  if (featuredItems.length) {
    return featuredItems;
  }

  return prisma.foodItem.findMany({
    ...sharedQuery,
    where: {
      isAvailable: true,
      kitchen: {
        isActive: true,
        acceptsOrders: true,
      },
      foodCategory: {
        isActive: true,
      },
    },
  });
}

function mapKitchen(kitchen: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: { toString(): string };
  longitude: { toString(): string };
  maxDeliveryDistanceKm: { toString(): string } | null;
  minimumOrderAmount: { toString(): string };
  deliveryFee: { toString(): string };
  freeDeliveryMinimum: { toString(): string } | null;
  preparationTimeMins: number;
  isActive: boolean;
  acceptsOrders: boolean;
  sortOrder: number;
  _count?: {
    foodItems: number;
    deliveryZones: number;
    foodOrders: number;
  };
}) {
  return {
    ...kitchen,
    latitude: Number(kitchen.latitude),
    longitude: Number(kitchen.longitude),
    maxDeliveryDistanceKm: kitchen.maxDeliveryDistanceKm
      ? Number(kitchen.maxDeliveryDistanceKm)
      : null,
    minimumOrderAmount: Number(kitchen.minimumOrderAmount),
    deliveryFee: Number(kitchen.deliveryFee),
    freeDeliveryMinimum: kitchen.freeDeliveryMinimum
      ? Number(kitchen.freeDeliveryMinimum)
      : null,
  };
}

function mapFoodItem(item: {
  id: string;
  kitchenId: string;
  foodCategoryId: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  imageUrl: string;
  price: { toString(): string };
  compareAtPrice: { toString(): string } | null;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  preparationTimeMins: number | null;
  kitchen?: {
    id: string;
    name: string;
    slug: string;
  };
  foodCategory?: {
    id: string;
    name: string;
    slug: string;
  };
}) {
  return {
    ...item,
    price: Number(item.price),
    compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
  };
}

function mapDeliveryZone(zone: {
  id: string;
  kitchenId: string;
  name: string;
  description: string | null;
  zoneType: "RADIUS" | "POLYGON";
  centerLatitude: { toString(): string } | null;
  centerLongitude: { toString(): string } | null;
  radiusKm: { toString(): string } | null;
  polygonCoordinates: unknown;
  deliveryFee: { toString(): string } | null;
  minimumOrderAmount: { toString(): string } | null;
  freeDeliveryMinimum: { toString(): string } | null;
  isActive: boolean;
  sortOrder: number;
  kitchen?: {
    id: string;
    name: string;
    slug: string;
  };
}) {
  return {
    ...zone,
    centerLatitude: zone.centerLatitude ? Number(zone.centerLatitude) : null,
    centerLongitude: zone.centerLongitude ? Number(zone.centerLongitude) : null,
    radiusKm: zone.radiusKm ? Number(zone.radiusKm) : null,
    polygonCoordinates: Array.isArray(zone.polygonCoordinates)
      ? zone.polygonCoordinates
      : [],
    deliveryFee: zone.deliveryFee ? Number(zone.deliveryFee) : null,
    minimumOrderAmount: zone.minimumOrderAmount ? Number(zone.minimumOrderAmount) : null,
    freeDeliveryMinimum: zone.freeDeliveryMinimum
      ? Number(zone.freeDeliveryMinimum)
      : null,
  };
}

function mapDeliveryAddress(address: {
  id: string;
  label: string | null;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  formattedAddress: string;
  placeId: string | null;
  latitude: { toString(): string };
  longitude: { toString(): string };
  deliveryInstructions: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...address,
    latitude: Number(address.latitude),
    longitude: Number(address.longitude),
  };
}

function mapFoodOrder(order: {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: { toString(): string };
  deliveryFee: { toString(): string };
  total: { toString(): string };
  itemCount: number;
  distanceKm: { toString(): string } | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  kitchen?: {
    id?: string;
    name: string;
  };
  deliveryZone?: {
    id?: string;
    name: string;
  } | null;
  deliveryAddress?: ReturnType<typeof mapDeliveryAddress>;
  items?: Array<{
    id: string;
    foodItemName: string;
    foodItemSlug: string;
    foodCategoryName: string;
    quantity: number;
    unitPrice: { toString(): string };
    lineTotal: { toString(): string };
    selectedOptions: unknown;
    foodItem?: {
      id: string;
      imageUrl: string;
    } | null;
  }>;
  user?: {
    id?: string;
    name: string | null;
    email: string | null;
  };
}) {
  return {
    ...order,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    total: Number(order.total),
    distanceKm: order.distanceKm ? Number(order.distanceKm) : null,
    items: order.items?.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
      selectedOptions: Array.isArray(item.selectedOptions) ? item.selectedOptions : [],
    })),
  };
}

export async function getFoodLandingData() {
  noStore();
  await ensureCloudKitchenDefaults();

  const [kitchens, categories, featuredItems] = await Promise.all([
    prisma.kitchen.findMany({
      where: {
        isActive: true,
        acceptsOrders: true,
      },
      include: {
        _count: {
          select: {
            foodItems: true,
            deliveryZones: true,
            foodOrders: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.foodCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            foodItems: {
              where: {
                isAvailable: true,
                kitchen: {
                  isActive: true,
                  acceptsOrders: true,
                },
              },
            },
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    getHomepageFoodItems(),
  ]);

  return {
    kitchens: kitchens.map(mapKitchen),
    categories,
    featuredItems: featuredItems.map(mapFoodItem),
  };
}

export async function getKitchenMenuById(kitchenId: string) {
  noStore();

  const kitchen = await prisma.kitchen.findFirst({
    where: {
      id: kitchenId,
      isActive: true,
      acceptsOrders: true,
    },
  });

  if (!kitchen) {
    return null;
  }

  const categories = await prisma.foodCategory.findMany({
    where: {
      isActive: true,
      foodItems: {
        some: {
          kitchenId,
          isAvailable: true,
        },
      },
    },
    include: {
      foodItems: {
        where: {
          kitchenId,
          isAvailable: true,
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return {
    kitchen: mapKitchen(kitchen),
    categories: categories.map((category) => ({
      ...category,
      foodItems: category.foodItems.map(mapFoodItem),
    })),
  };
}

export async function getFoodItemBySlug(slug: string, kitchenId: string) {
  noStore();

  const item = await prisma.foodItem.findFirst({
    where: {
      slug,
      kitchenId,
      isAvailable: true,
      kitchen: {
        isActive: true,
        acceptsOrders: true,
      },
    },
    include: {
      kitchen: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      foodCategory: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return item ? mapFoodItem(item) : null;
}

export async function getKitchenDeliveryCoverage() {
  noStore();
  await ensureDefaultKitchen();

  const kitchens = await prisma.kitchen.findMany({
    where: {
      isActive: true,
      acceptsOrders: true,
    },
    include: {
      deliveryZones: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return kitchens.map((kitchen) => ({
    ...mapKitchen(kitchen),
    deliveryZones: kitchen.deliveryZones.map(mapDeliveryZone),
  }));
}

export async function getCustomerDeliveryAddresses(userId: string) {
  noStore();

  const addresses = await prisma.deliveryAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  return addresses.map(mapDeliveryAddress);
}

export async function getCustomerFoodOrders(userId: string) {
  noStore();

  const orders = await prisma.foodOrder.findMany({
    where: { userId },
    include: {
      kitchen: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map(mapFoodOrder);
}

export async function getCustomerFoodOrderById(userId: string, orderId: string) {
  noStore();

  const order = await prisma.foodOrder.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      kitchen: {
        select: {
          id: true,
          name: true,
        },
      },
      deliveryZone: {
        select: {
          id: true,
          name: true,
        },
      },
      deliveryAddress: true,
      items: {
        include: {
          foodItem: {
            select: {
              id: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!order) {
    return null;
  }

  return mapFoodOrder({
    ...order,
    deliveryAddress: mapDeliveryAddress(order.deliveryAddress),
  });
}

export async function getKitchenOptions() {
  noStore();
  await ensureDefaultKitchen();

  return prisma.kitchen.findMany({
    select: {
      id: true,
      name: true,
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getFoodCategoryOptions() {
  noStore();
  await ensureDefaultFoodCategory();

  return prisma.foodCategory.findMany({
    select: {
      id: true,
      name: true,
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getAdminCloudKitchenDashboard() {
  noStore();
  await ensureCloudKitchenDefaults();

  const [kitchens, categories, foods, orders, revenue, recentOrders] = await Promise.all([
    prisma.kitchen.count(),
    prisma.foodCategory.count(),
    prisma.foodItem.count(),
    prisma.foodOrder.count(),
    prisma.foodOrder.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: {
          not: "CANCELLED",
        },
      },
    }),
    prisma.foodOrder.findMany({
      include: {
        kitchen: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return {
    stats: {
      kitchens,
      categories,
      foods,
      orders,
      revenue: toNumber(revenue._sum.total),
    },
    recentOrders: recentOrders.map(mapFoodOrder),
  };
}

export async function getAdminKitchens(query?: string) {
  noStore();
  await ensureDefaultKitchen();

  const kitchens = await prisma.kitchen.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query } },
            { city: { contains: query } },
            { state: { contains: query } },
          ],
        }
      : undefined,
    include: {
      _count: {
        select: {
          foodItems: true,
          deliveryZones: true,
          foodOrders: true,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return kitchens.map(mapKitchen);
}

export async function getAdminKitchenById(id: string) {
  noStore();

  const kitchen = await prisma.kitchen.findUnique({
    where: { id },
  });

  return kitchen ? mapKitchen(kitchen) : null;
}

export async function getAdminFoodCategories() {
  noStore();
  await ensureDefaultFoodCategory();

  const categories = await prisma.foodCategory.findMany({
    include: {
      _count: {
        select: {
          foodItems: true,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return categories;
}

export async function getAdminFoodCategoryById(id: string) {
  noStore();

  return prisma.foodCategory.findUnique({
    where: { id },
  });
}

export async function getAdminFoodItems(filters?: {
  query?: string;
  kitchenId?: string;
  categoryId?: string;
}) {
  noStore();

  const items = await prisma.foodItem.findMany({
    where: {
      ...(filters?.query
        ? {
            OR: [
              { name: { contains: filters.query } },
              { description: { contains: filters.query } },
            ],
          }
        : {}),
      ...(filters?.kitchenId ? { kitchenId: filters.kitchenId } : {}),
      ...(filters?.categoryId ? { foodCategoryId: filters.categoryId } : {}),
    },
    include: {
      kitchen: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      foodCategory: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return items.map(mapFoodItem);
}

export async function getAdminFoodItemById(id: string) {
  noStore();

  const item = await prisma.foodItem.findUnique({
    where: { id },
    include: {
      kitchen: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      foodCategory: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return item ? mapFoodItem(item) : null;
}

export async function getAdminDeliveryZones(kitchenId?: string) {
  noStore();

  const zones = await prisma.deliveryZone.findMany({
    where: kitchenId ? { kitchenId } : undefined,
    include: {
      kitchen: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return zones.map(mapDeliveryZone);
}

export async function getAdminDeliveryZoneById(id: string) {
  noStore();

  const zone = await prisma.deliveryZone.findUnique({
    where: { id },
    include: {
      kitchen: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return zone ? mapDeliveryZone(zone) : null;
}

export async function getAdminFoodOrders(filters?: {
  query?: string;
  status?: string;
  kitchenId?: string;
}) {
  noStore();

  const orders = await prisma.foodOrder.findMany({
    where: {
      ...(filters?.status ? { status: filters.status as never } : {}),
      ...(filters?.kitchenId ? { kitchenId: filters.kitchenId } : {}),
      ...(filters?.query
        ? {
            OR: [
              { orderNumber: { contains: filters.query } },
              { customerName: { contains: filters.query } },
              { customerEmail: { contains: filters.query } },
              { kitchen: { name: { contains: filters.query } } },
            ],
          }
        : {}),
    },
    include: {
      kitchen: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map(mapFoodOrder);
}

export async function getAdminFoodOrderById(id: string) {
  noStore();

  const order = await prisma.foodOrder.findUnique({
    where: { id },
    include: {
      kitchen: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      deliveryZone: {
        select: {
          id: true,
          name: true,
        },
      },
      deliveryAddress: true,
      items: {
        include: {
          foodItem: {
            select: {
              id: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!order) {
    return null;
  }

  return mapFoodOrder({
    ...order,
    deliveryAddress: mapDeliveryAddress(order.deliveryAddress),
  });
}






