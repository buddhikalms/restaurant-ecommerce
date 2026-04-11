import { unstable_noStore as noStore } from "next/cache";

import type { FoodCartInput } from "@/components/providers/food-cart-provider";
import { getFoodLandingData, getKitchenMenuById } from "@/lib/data/cloud-kitchen";

export type StorefrontOrderType = "delivery" | "takeaway" | "dine-in";

export type StorefrontBranch = {
  id: string;
  name: string;
  area: string;
  address: string;
  eta: string;
  deliveryFee: number;
  minimumOrder: number;
  phone: string;
};

export type StorefrontBrand = {
  id: string;
  name: string;
  description: string;
};

export type StorefrontCategory = {
  id: string;
  slug: string;
  name: string;
  description?: string;
};

export type StorefrontOptionChoice = {
  id: string;
  name: string;
  priceDelta: number;
};

export type StorefrontOptionGroup = {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  selection: "single" | "multiple";
  min?: number;
  max?: number;
  options: StorefrontOptionChoice[];
};

export type StorefrontProduct = {
  id: string;
  slug: string;
  categoryId: string;
  brandId: string;
  name: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  compareAtPrice: number | null;
  badges: string[];
  labels: string[];
  prepTime: string;
  isAvailable: boolean;
  itemType: "SINGLE" | "COMBO";
  offerTitle: string | null;
  includedItemsSummary: string | null;
  optionGroups: StorefrontOptionGroup[];
};

export type StorefrontPromoCode = {
  code: string;
  label: string;
  type: "percentage" | "fixed" | "delivery";
  amount: number;
};

export type StorefrontScheduleOption = {
  id: string;
  label: string;
};

export type CloudKitchenStorefrontData = {
  kitchen: {
    id: string;
    name: string;
    tagline: string;
    description: string;
    coverImageUrl: string;
    logoImageUrl: string;
    cuisines: string[];
    rating: number;
    reviewCount: number;
    minOrder: number;
    deliveryFee: number;
    deliveryTime: string;
    isOpen: boolean;
    nextStatusNote: string;
    address: string;
    branchesLabel: string;
    taxRate: number;
    defaultBranchId: string;
  };
  brands: StorefrontBrand[];
  branches: StorefrontBranch[];
  categories: StorefrontCategory[];
  products: StorefrontProduct[];
  promoCodes: StorefrontPromoCode[];
  scheduleOptions: StorefrontScheduleOption[];
  initialCartItems: FoodCartInput[];
};

type KitchenMenuData = NonNullable<Awaited<ReturnType<typeof getKitchenMenuById>>>;

const DEFAULT_COVER_IMAGE = "/cheff2.jpg";
const DEFAULT_LOGO_IMAGE = "/cheff.jpg";

export async function getCloudKitchenStorefrontData(
  kitchenId?: string | null,
): Promise<CloudKitchenStorefrontData | null> {
  noStore();

  const resolvedKitchenId = kitchenId ?? (await getDefaultKitchenId());

  if (!resolvedKitchenId) {
    return null;
  }

  const menu = await getKitchenMenuById(resolvedKitchenId);

  if (!menu) {
    return null;
  }

  return buildCloudKitchenStorefrontData(menu);
}

async function getDefaultKitchenId() {
  const landing = await getFoodLandingData();
  return landing.kitchens[0]?.id ?? null;
}

function buildCloudKitchenStorefrontData(menu: KitchenMenuData): CloudKitchenStorefrontData {
  const brandId = `kitchen-${menu.kitchen.id}`;
  const brandName = menu.kitchen.name;
  const address = formatKitchenAddress(menu.kitchen);
  const eta = formatPreparationTime(menu.kitchen.preparationTimeMins);
  const cuisines = menu.categories.slice(0, 5).map((category) => category.name);
  const products = menu.categories.flatMap((category) =>
    category.foodItems.map((item) => ({
      id: item.id,
      slug: item.slug,
      categoryId: category.id,
      brandId,
      name: item.name,
      shortDescription:
        item.shortDescription?.trim() ||
        item.offerTitle?.trim() ||
        category.description?.trim() ||
        "Freshly prepared and ready to order.",
      description: item.description,
      imageUrl: item.imageUrl,
      basePrice: item.price,
      compareAtPrice: item.compareAtPrice,
      badges: getBadges(item),
      labels: inferLabels(item),
      prepTime: formatPreparationTime(
        item.preparationTimeMins ?? menu.kitchen.preparationTimeMins,
      ),
      isAvailable: true,
      itemType: item.itemType,
      offerTitle: item.offerTitle,
      includedItemsSummary: item.includedItemsSummary,
      optionGroups: buildOptionGroups(category.name),
    })),
  );

  return {
    kitchen: {
      id: menu.kitchen.id,
      name: menu.kitchen.name,
      tagline:
        menu.kitchen.description?.trim() ||
        "Fast-moving food ordering with kitchen-side fulfillment and account order tracking.",
      description:
        "Browse by category, add notes, and move from cart to checkout without leaving the storefront.",
      coverImageUrl: DEFAULT_COVER_IMAGE,
      logoImageUrl: DEFAULT_LOGO_IMAGE,
      cuisines: cuisines.length ? cuisines : ["Meals", "Snacks", "Drinks"],
      rating: 4.8,
      reviewCount: Math.max(24, products.length * 17),
      minOrder: menu.kitchen.minimumOrderAmount,
      deliveryFee: menu.kitchen.deliveryFee,
      deliveryTime: eta,
      isOpen: menu.kitchen.acceptsOrders,
      nextStatusNote: menu.kitchen.acceptsOrders ? "Accepting orders now" : "Currently unavailable",
      address,
      branchesLabel: "Live kitchen fulfillment",
      taxRate: 0,
      defaultBranchId: menu.kitchen.id,
    },
    brands: [
      {
        id: brandId,
        name: brandName,
        description: "Primary kitchen menu",
      },
    ],
    branches: [
      {
        id: menu.kitchen.id,
        name: menu.kitchen.name,
        area: [menu.kitchen.city, menu.kitchen.state].filter(Boolean).join(", "),
        address,
        eta,
        deliveryFee: menu.kitchen.deliveryFee,
        minimumOrder: menu.kitchen.minimumOrderAmount,
        phone: menu.kitchen.phone || "Kitchen contact unavailable",
      },
    ],
    categories: menu.categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description ?? undefined,
    })),
    products,
    promoCodes: [],
    scheduleOptions: [
      { id: "asap", label: "As soon as possible" },
      { id: "next-slot", label: "Next available kitchen slot" },
      { id: "later-today", label: "Later today" },
    ],
    initialCartItems: [],
  };
}

function formatKitchenAddress(kitchen: KitchenMenuData["kitchen"]) {
  return [
    kitchen.addressLine1,
    kitchen.addressLine2,
    kitchen.city,
    kitchen.state,
    kitchen.postalCode,
    kitchen.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function formatPreparationTime(minutes: number) {
  const lower = Math.max(10, minutes);
  const upper = lower + 10;
  return `${lower}-${upper} min`;
}

function getBadges(item: KitchenMenuData["categories"][number]["foodItems"][number]) {
  const badges: string[] = [];

  if (item.isFeatured) {
    badges.push("Popular");
  }

  if (item.itemType === "COMBO") {
    badges.push("Combo");
  }

  return badges;
}

function inferLabels(item: KitchenMenuData["categories"][number]["foodItems"][number]) {
  const source = [
    item.name,
    item.shortDescription,
    item.description,
    item.offerTitle,
    item.offerDescription,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const labels: string[] = [];

  if (source.includes("veg") || source.includes("vegetarian") || source.includes("paneer")) {
    labels.push("Veg");
  }

  if (source.includes("spicy") || source.includes("chilli") || source.includes("chili")) {
    labels.push("Spicy");
  }

  if (source.includes("halal")) {
    labels.push("Halal");
  }

  return labels;
}

function buildOptionGroups(categoryName: string): StorefrontOptionGroup[] {
  const lowerCategory = categoryName.toLowerCase();

  if (lowerCategory.includes("drink")) {
    return [
      {
        id: "drink-service",
        name: "Serving preferences",
        description: "Optional preparation requests with no added charge.",
        required: false,
        selection: "multiple",
        max: 2,
        options: [
          { id: "less-ice", name: "Less ice", priceDelta: 0 },
          { id: "no-straw", name: "No straw", priceDelta: 0 },
          { id: "extra-napkins", name: "Extra napkins", priceDelta: 0 },
        ],
      },
    ];
  }

  if (lowerCategory.includes("dessert")) {
    return [
      {
        id: "dessert-preferences",
        name: "Dessert preferences",
        description: "Optional serving requests with no added charge.",
        required: false,
        selection: "multiple",
        max: 2,
        options: [
          { id: "extra-napkins", name: "Extra napkins", priceDelta: 0 },
          { id: "include-cutlery", name: "Include cutlery", priceDelta: 0 },
          { id: "serve-chilled", name: "Serve chilled", priceDelta: 0 },
        ],
      },
    ];
  }

  return [
    {
      id: "kitchen-preferences",
      name: "Kitchen preferences",
      description: "Optional prep requests that will be shown on the kitchen ticket.",
      required: false,
      selection: "multiple",
      max: 2,
      options: [
        { id: "less-spicy", name: "Less spicy", priceDelta: 0 },
        { id: "cut-in-half", name: "Cut in half", priceDelta: 0 },
        { id: "extra-napkins", name: "Extra napkins", priceDelta: 0 },
      ],
    },
  ];
}
