import { PrismaClient, Role, OrderStatus, ProductType, VatMode, PaymentGateway, PaymentStatus, ShippingMethodType, GatewayMode, FoodItemType } from "../generated/prisma";
import { hash } from "bcryptjs";

import {
  CLOUD_KITCHEN_SERVICE_DEFAULTS,
  DEFAULT_CLOUD_KITCHEN_LOCATION,
  DEFAULT_CLOUD_KITCHEN_NAME,
  DEFAULT_CLOUD_KITCHEN_SLUG,
  DEFAULT_FOOD_CATEGORIES,
} from "../lib/cloud-kitchen/defaults";
import { summarizeActiveProductVariants } from "../lib/product-variants";

const prisma = new PrismaClient();

type SeedVariant = {
  name: string;
  sku: string;
  normalPrice: number;
  wholesalePrice: number;
  stockQuantity: number;
  minOrderQuantity: number;
  isActive?: boolean;
};

type SeedProduct = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  imageUrl: string;
  galleryImageUrls?: string[];
  categorySlug: string;
  productType?: ProductType;
  variantLabel?: string;
  normalPrice?: number;
  wholesalePrice?: number;
  stockQuantity?: number;
  minOrderQuantity?: number;
  variants?: SeedVariant[];
};

type SeedFoodItem = {
  name: string;
  slug: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  price: number;
  compareAtPrice?: number | null;
  itemType?: FoodItemType;
  offerTitle?: string | null;
  offerDescription?: string | null;
  includedItemsSummary?: string | null;
  isFeatured?: boolean;
  sortOrder?: number;
  preparationTimeMins?: number | null;
};

function summarizeSeedProduct(product: SeedProduct) {
  if (product.productType === ProductType.VARIABLE && product.variants?.length) {
    return summarizeActiveProductVariants(
      product.variants.map((variant) => ({
        ...variant,
        isActive: variant.isActive ?? true
      }))
    );
  }

  return {
    normalPrice: product.normalPrice ?? 0,
    wholesalePrice: product.wholesalePrice ?? 0,
    stockQuantity: product.stockQuantity ?? 0,
    minOrderQuantity: product.minOrderQuantity ?? 1
  };
}

async function main() {
  const adminPasswordHash = await hash("Admin@12345", 12);
  const retailPasswordHash = await hash("Customer@12345", 12);
  const wholesalePasswordHash = await hash("Wholesale@12345", 12);

  const categoriesData = [
    {
      name: "Rice & Grains",
      slug: "rice-grains",
      description: "Bulk rice, flour, and pantry staples for restaurant kitchens."
    },
    {
      name: "Spices & Seasonings",
      slug: "spices-seasonings",
      description: "High-volume spices, curry blends, pepper, and seasoning mixes."
    },
    {
      name: "Cooking Oil",
      slug: "cooking-oil",
      description: "Restaurant-grade cooking oils and frying essentials."
    },
    {
      name: "Frozen Foods",
      slug: "frozen-foods",
      description: "Frozen proteins, vegetables, snacks, and convenience items."
    },
    {
      name: "Fresh Produce",
      slug: "fresh-produce",
      description: "Wholesale vegetables and fresh ingredient bundles."
    },
    {
      name: "Packaging Supplies",
      slug: "packaging-supplies",
      description: "Takeaway containers, cups, wraps, and restaurant packaging."
    },
    {
      name: "Beverages",
      slug: "beverages",
      description: "Bulk juices, mixers, bottled water, and soft drinks."
    }
  ];

  const categoryRecords = await Promise.all(
    categoriesData.map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: category,
        create: category
      })
    )
  );

  const productsData: SeedProduct[] = [
    {
      name: "Premium Basmati Rice",
      slug: "premium-basmati-rice-25kg",
      sku: "RICE-001",
      description: "Long-grain basmati rice ideal for biryani, pilaf, and buffet service.",
      imageUrl: "https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?auto=format&fit=crop&w=1200&q=80",
      galleryImageUrls: [
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80"
      ],
      categorySlug: "rice-grains",
      productType: ProductType.VARIABLE,
      variantLabel: "Pack size",
      variants: [
        {
          name: "10kg bag",
          sku: "RICE-001-10",
          normalPrice: 24.99,
          wholesalePrice: 20.5,
          stockQuantity: 90,
          minOrderQuantity: 2
        },
        {
          name: "25kg sack",
          sku: "RICE-001-25",
          normalPrice: 52.5,
          wholesalePrice: 42.5,
          stockQuantity: 120,
          minOrderQuantity: 2
        },
        {
          name: "50kg pantry refill",
          sku: "RICE-001-50",
          normalPrice: 98,
          wholesalePrice: 81,
          stockQuantity: 42,
          minOrderQuantity: 1
        }
      ]
    },
    {
      name: "Red Rice 25kg",
      slug: "red-rice-25kg",
      sku: "RICE-002",
      description: "Restaurant-pack red rice for healthy menu programs and catering.",
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80",
      galleryImageUrls: [
        "https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?auto=format&fit=crop&w=1200&q=80"
      ],
      normalPrice: 45.99,
      wholesalePrice: 37.99,
      stockQuantity: 85,
      minOrderQuantity: 2,
      categorySlug: "rice-grains"
    },
    {
      name: "Ground Turmeric 5kg",
      slug: "ground-turmeric-5kg",
      sku: "SPICE-101",
      description: "Bright, aromatic turmeric powder for curry bases, soups, and marinades.",
      imageUrl: "https://images.unsplash.com/photo-1615485291234-9a74d3c9a7eb?auto=format&fit=crop&w=1200&q=80",
      galleryImageUrls: [
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80"
      ],
      normalPrice: 34.5,
      wholesalePrice: 29,
      stockQuantity: 60,
      minOrderQuantity: 1,
      categorySlug: "spices-seasonings"
    },
    {
      name: "Crushed Black Pepper 5kg",
      slug: "crushed-black-pepper-5kg",
      sku: "SPICE-102",
      description: "Coarse black pepper for sauces, rubs, and kitchen prep stations.",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80",
      normalPrice: 41,
      wholesalePrice: 34.25,
      stockQuantity: 45,
      minOrderQuantity: 1,
      categorySlug: "spices-seasonings"
    },
    {
      name: "Sunflower Frying Oil 20L",
      slug: "sunflower-frying-oil-20l",
      sku: "OIL-201",
      description: "Neutral high-heat oil built for deep fryers and busy service windows.",
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1200&q=80",
      galleryImageUrls: [
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=80&sat=-5"
      ],
      normalPrice: 66,
      wholesalePrice: 55,
      stockQuantity: 70,
      minOrderQuantity: 1,
      categorySlug: "cooking-oil"
    },
    {
      name: "Frozen Mixed Vegetables 10kg",
      slug: "frozen-mixed-vegetables-10kg",
      sku: "FRZ-301",
      description: "IQF mixed vegetables for stir fry, soup stations, and catering prep.",
      imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
      normalPrice: 29.75,
      wholesalePrice: 24.75,
      stockQuantity: 90,
      minOrderQuantity: 2,
      categorySlug: "frozen-foods"
    },
    {
      name: "Frozen Chicken Wings 10kg",
      slug: "frozen-chicken-wings-10kg",
      sku: "FRZ-302",
      description: "Restaurant-grade chicken wings for grills, fryers, and combo meals.",
      imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=1200&q=80",
      normalPrice: 58,
      wholesalePrice: 48,
      stockQuantity: 65,
      minOrderQuantity: 1,
      categorySlug: "frozen-foods"
    },
    {
      name: "Fresh Onion Sack 20kg",
      slug: "fresh-onion-sack-20kg",
      sku: "VEG-401",
      description: "Bulk onion sack suited for daily kitchen prep and prep kitchen supply.",
      imageUrl: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=1200&q=80",
      normalPrice: 22.5,
      wholesalePrice: 18.5,
      stockQuantity: 110,
      minOrderQuantity: 2,
      categorySlug: "fresh-produce"
    },
    {
      name: "Fresh Carrot Crate 15kg",
      slug: "fresh-carrot-crate-15kg",
      sku: "VEG-402",
      description: "High-yield carrots for salads, soups, roasting, and catering packs.",
      imageUrl: "https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=1200&q=80",
      galleryImageUrls: [
        "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=80"
      ],
      normalPrice: 18.75,
      wholesalePrice: 15.25,
      stockQuantity: 95,
      minOrderQuantity: 2,
      categorySlug: "fresh-produce"
    },
    {
      name: "Takeaway Food Containers 250 Pack",
      slug: "takeaway-food-containers-250-pack",
      sku: "PKG-501",
      description: "Microwave-safe containers built for delivery and takeaway operations.",
      imageUrl: "https://images.unsplash.com/photo-1615486363977-7938d161f7b1?auto=format&fit=crop&w=1200&q=80",
      normalPrice: 38,
      wholesalePrice: 32,
      stockQuantity: 140,
      minOrderQuantity: 1,
      categorySlug: "packaging-supplies"
    },
    {
      name: "Paper Cups 500 Pack",
      slug: "paper-cups-500-pack",
      sku: "PKG-502",
      description: "Hot and cold beverage paper cups for cafes and beverage counters.",
      imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
      galleryImageUrls: [
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1517701550927-30cf4ba1f4d6?auto=format&fit=crop&w=1200&q=80"
      ],
      categorySlug: "packaging-supplies",
      productType: ProductType.VARIABLE,
      variantLabel: "Cup size",
      variants: [
        {
          name: "8 oz / 500 pack",
          sku: "PKG-502-8OZ",
          normalPrice: 14.5,
          wholesalePrice: 12,
          stockQuantity: 120,
          minOrderQuantity: 1
        },
        {
          name: "12 oz / 500 pack",
          sku: "PKG-502-12OZ",
          normalPrice: 25.5,
          wholesalePrice: 21,
          stockQuantity: 160,
          minOrderQuantity: 1
        },
        {
          name: "16 oz / 500 pack",
          sku: "PKG-502-16OZ",
          normalPrice: 29.5,
          wholesalePrice: 24.5,
          stockQuantity: 110,
          minOrderQuantity: 1
        }
      ]
    },
    {
      name: "Sparkling Water 24 Pack",
      slug: "sparkling-water-24-pack",
      sku: "BEV-601",
      description: "Premium bottled sparkling water for dine-in and event service.",
      imageUrl: "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=1200&q=80",
      galleryImageUrls: [
        "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1200&q=80"
      ],
      normalPrice: 19.99,
      wholesalePrice: 16.5,
      stockQuantity: 150,
      minOrderQuantity: 2,
      categorySlug: "beverages"
    }
  ];

  const products: Array<{
    record: Awaited<ReturnType<typeof prisma.product.upsert>>;
    seed: SeedProduct;
  }> = [];

  for (const product of productsData) {
    const category = categoryRecords.find((item) => item.slug === product.categorySlug);
    if (!category) continue;

    const summary = summarizeSeedProduct(product);
    const record = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        sku: product.sku,
        description: product.description,
        imageUrl: product.imageUrl,
        galleryImageUrls: product.galleryImageUrls ?? [],
        productType: product.productType ?? ProductType.SIMPLE,
        variantLabel: product.productType === ProductType.VARIABLE ? product.variantLabel ?? "Option" : null,
        vatMode: VatMode.INCLUDED,
        vatRate: 20,
        normalPrice: summary.normalPrice,
        wholesalePrice: summary.wholesalePrice,
        stockQuantity: summary.stockQuantity,
        minOrderQuantity: summary.minOrderQuantity,
        categoryId: category.id,
        isActive: true
      },
      create: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        imageUrl: product.imageUrl,
        galleryImageUrls: product.galleryImageUrls ?? [],
        productType: product.productType ?? ProductType.SIMPLE,
        variantLabel: product.productType === ProductType.VARIABLE ? product.variantLabel ?? "Option" : null,
        vatMode: VatMode.INCLUDED,
        vatRate: 20,
        normalPrice: summary.normalPrice,
        wholesalePrice: summary.wholesalePrice,
        stockQuantity: summary.stockQuantity,
        minOrderQuantity: summary.minOrderQuantity,
        categoryId: category.id,
        isActive: true
      }
    });

    await prisma.productVariant.deleteMany({
      where: {
        productId: record.id
      }
    });

    if (product.productType === ProductType.VARIABLE && product.variants?.length) {
      await prisma.productVariant.createMany({
        data: product.variants.map((variant, index) => ({
          productId: record.id,
          name: variant.name,
          sku: variant.sku,
          normalPrice: variant.normalPrice,
          wholesalePrice: variant.wholesalePrice,
          stockQuantity: variant.stockQuantity,
          minOrderQuantity: variant.minOrderQuantity,
          isActive: variant.isActive ?? true,
          position: index
        }))
      });
    }

    products.push({ record, seed: product });
  }

  const admin = await prisma.user.upsert({
    where: { email: "admin@harvestwholesale.com" },
    update: {
      name: "Operations Admin",
      role: Role.ADMIN,
      businessName: "CeylonTaste",
      phone: "+1 555 0100",
      passwordHash: adminPasswordHash
    },
    create: {
      name: "Operations Admin",
      email: "admin@harvestwholesale.com",
      role: Role.ADMIN,
      businessName: "CeylonTaste",
      phone: "+1 555 0100",
      passwordHash: adminPasswordHash
    }
  });

  const wholesaleCustomer = await prisma.user.upsert({
    where: { email: "buyer@sunsetbistro.com" },
    update: {
      name: "Elena Rivera",
      role: Role.WHOLESALE_CUSTOMER,
      businessName: "Sunset Bistro",
      phone: "+1 555 0111",
      passwordHash: wholesalePasswordHash
    },
    create: {
      name: "Elena Rivera",
      email: "buyer@sunsetbistro.com",
      role: Role.WHOLESALE_CUSTOMER,
      businessName: "Sunset Bistro",
      phone: "+1 555 0111",
      passwordHash: wholesalePasswordHash
    }
  });

  const retailCustomer = await prisma.user.upsert({
    where: { email: "sophia@harvesthome.com" },
    update: {
      name: "Sophia Chen",
      role: Role.CUSTOMER,
      businessName: null,
      phone: "+1 555 0222",
      passwordHash: retailPasswordHash
    },
    create: {
      name: "Sophia Chen",
      email: "sophia@harvesthome.com",
      role: Role.CUSTOMER,
      phone: "+1 555 0222",
      passwordHash: retailPasswordHash
    }
  });

  const shippingAddress = await prisma.address.upsert({
    where: { id: "seed-shipping-address" },
    update: {
      userId: wholesaleCustomer.id,
      label: "Main Kitchen",
      contactName: wholesaleCustomer.name,
      businessName: wholesaleCustomer.businessName,
      line1: "241 Harbor Street",
      line2: "Suite 5",
      city: "Seattle",
      state: "WA",
      postalCode: "98101",
      country: "USA",
      phone: wholesaleCustomer.phone ?? "+1 555 0111",
      isDefault: true
    },
    create: {
      id: "seed-shipping-address",
      userId: wholesaleCustomer.id,
      label: "Main Kitchen",
      contactName: wholesaleCustomer.name,
      businessName: wholesaleCustomer.businessName,
      line1: "241 Harbor Street",
      line2: "Suite 5",
      city: "Seattle",
      state: "WA",
      postalCode: "98101",
      country: "USA",
      phone: wholesaleCustomer.phone ?? "+1 555 0111",
      isDefault: true
    }
  });

  await prisma.address.upsert({
    where: { id: "seed-retail-address" },
    update: {
      userId: retailCustomer.id,
      label: "Home",
      contactName: retailCustomer.name,
      businessName: null,
      line1: "145 Pine Avenue",
      line2: null,
      city: "Portland",
      state: "OR",
      postalCode: "97205",
      country: "USA",
      phone: retailCustomer.phone ?? "+1 555 0222",
      isDefault: true
    },
    create: {
      id: "seed-retail-address",
      userId: retailCustomer.id,
      label: "Home",
      contactName: retailCustomer.name,
      businessName: null,
      line1: "145 Pine Avenue",
      city: "Portland",
      state: "OR",
      postalCode: "97205",
      country: "USA",
      phone: retailCustomer.phone ?? "+1 555 0222",
      isDefault: true
    }
  });

  await prisma.wholesaleProfile.upsert({
    where: { userId: wholesaleCustomer.id },
    update: {
      firstName: "Elena",
      lastName: "Rivera",
      mobileNumber: wholesaleCustomer.phone ?? "+1 555 0111",
      telephoneNumber: wholesaleCustomer.phone ?? "+1 555 0111",
      tradingName: wholesaleCustomer.businessName,
      deliveryAddressLine1: shippingAddress.line1,
      deliveryAddressLine2: shippingAddress.line2,
      deliveryAddressLine3: null,
      deliveryTown: shippingAddress.city,
      deliveryPostcode: shippingAddress.postalCode,
      differentInvoiceAddress: false,
      invoiceAddressLine1: null,
      invoiceAddressLine2: null,
      invoiceAddressLine3: null,
      invoiceTown: null,
      invoicePostcode: null,
      companyType: "Limited company",
      companyNumber: "US-9821457",
      directorName: "Elena Rivera",
      businessType: "Restaurant"
    },
    create: {
      userId: wholesaleCustomer.id,
      firstName: "Elena",
      lastName: "Rivera",
      mobileNumber: wholesaleCustomer.phone ?? "+1 555 0111",
      telephoneNumber: wholesaleCustomer.phone ?? "+1 555 0111",
      tradingName: wholesaleCustomer.businessName,
      deliveryAddressLine1: shippingAddress.line1,
      deliveryAddressLine2: shippingAddress.line2,
      deliveryAddressLine3: null,
      deliveryTown: shippingAddress.city,
      deliveryPostcode: shippingAddress.postalCode,
      differentInvoiceAddress: false,
      invoiceAddressLine1: null,
      invoiceAddressLine2: null,
      invoiceAddressLine3: null,
      invoiceTown: null,
      invoicePostcode: null,
      companyType: "Limited company",
      companyNumber: "US-9821457",
      directorName: "Elena Rivera",
      businessType: "Restaurant"
    }
  });
  await prisma.storeSettings.upsert({
    where: { id: "store-settings" },
    update: {
      deliveryNotes: "Delivery options and online payments are managed from the admin settings screen.",
      defaultHandlingFee: 1.5,
      weightUnit: "kg",
      dimensionUnit: "cm",
      mapsEnabled: false,
      defaultMapLatitude: 47.6062,
      defaultMapLongitude: -122.3321,
      defaultMapZoom: 11,
      storeLocationName: "CeylonTaste Warehouse",
      storeAddress: "241 Harbor Street, Seattle, WA 98101",
      storeLatitude: 47.6062,
      storeLongitude: -122.3321,
      serviceAreaCountries: ["USA"]
    },
    create: {
      id: "store-settings",
      deliveryNotes: "Delivery options and online payments are managed from the admin settings screen.",
      defaultHandlingFee: 1.5,
      weightUnit: "kg",
      dimensionUnit: "cm",
      mapsEnabled: false,
      defaultMapLatitude: 47.6062,
      defaultMapLongitude: -122.3321,
      defaultMapZoom: 11,
      storeLocationName: "CeylonTaste Warehouse",
      storeAddress: "241 Harbor Street, Seattle, WA 98101",
      storeLatitude: 47.6062,
      storeLongitude: -122.3321,
      serviceAreaCountries: ["USA"]
    }
  });

  const seattleZone = await prisma.shippingZone.upsert({
    where: { id: "seed-zone-seattle" },
    update: {
      name: "Seattle Local",
      description: "Local delivery and pickup rules for the Seattle service area.",
      isEnabled: true,
      sortOrder: 0
    },
    create: {
      id: "seed-zone-seattle",
      name: "Seattle Local",
      description: "Local delivery and pickup rules for the Seattle service area.",
      isEnabled: true,
      sortOrder: 0
    }
  });

  const westCoastZone = await prisma.shippingZone.upsert({
    where: { id: "seed-zone-west-coast" },
    update: {
      name: "West Coast",
      description: "Regional delivery rules for WA, OR, and CA.",
      isEnabled: true,
      sortOrder: 1
    },
    create: {
      id: "seed-zone-west-coast",
      name: "West Coast",
      description: "Regional delivery rules for WA, OR, and CA.",
      isEnabled: true,
      sortOrder: 1
    }
  });

  const domesticZone = await prisma.shippingZone.upsert({
    where: { id: "seed-zone-domestic" },
    update: {
      name: "Domestic Fallback",
      description: "Fallback shipping rules for the rest of the USA.",
      isEnabled: true,
      sortOrder: 99
    },
    create: {
      id: "seed-zone-domestic",
      name: "Domestic Fallback",
      description: "Fallback shipping rules for the rest of the USA.",
      isEnabled: true,
      sortOrder: 99
    }
  });

  await prisma.shippingZoneRegion.deleteMany({
    where: {
      shippingZoneId: {
        in: [seattleZone.id, westCoastZone.id, domesticZone.id]
      }
    }
  });

  await prisma.shippingZoneRegion.createMany({
    data: [
      {
        shippingZoneId: seattleZone.id,
        country: "USA",
        state: "WA",
        city: "Seattle",
        postalCodePattern: "981*",
        sortOrder: 0
      },
      {
        shippingZoneId: westCoastZone.id,
        country: "USA",
        state: "WA, OR, CA",
        sortOrder: 0
      },
      {
        shippingZoneId: domesticZone.id,
        country: "USA",
        sortOrder: 0
      }
    ]
  });

  const pickupMethod = await prisma.shippingMethod.upsert({
    where: { id: "seed-method-pickup" },
    update: {
      shippingZoneId: seattleZone.id,
      name: "Warehouse pickup",
      description: "Collect from the Seattle warehouse.",
      type: ShippingMethodType.STORE_PICKUP,
      baseCost: 0,
      sortOrder: 0,
      estimatedMinDays: 0,
      estimatedMaxDays: 1,
      instructions: "Pickup is available during warehouse hours.",
      isEnabled: true,
      codAllowed: false
    },
    create: {
      id: "seed-method-pickup",
      shippingZoneId: seattleZone.id,
      name: "Warehouse pickup",
      description: "Collect from the Seattle warehouse.",
      type: ShippingMethodType.STORE_PICKUP,
      baseCost: 0,
      sortOrder: 0,
      estimatedMinDays: 0,
      estimatedMaxDays: 1,
      instructions: "Pickup is available during warehouse hours.",
      isEnabled: true,
      codAllowed: false
    }
  });

  const localDeliveryMethod = await prisma.shippingMethod.upsert({
    where: { id: "seed-method-local-delivery" },
    update: {
      shippingZoneId: seattleZone.id,
      name: "Local delivery",
      description: "Same-area local delivery with COD support.",
      type: ShippingMethodType.LOCAL_DELIVERY,
      baseCost: 8,
      maximumDistanceKm: 20,
      sortOrder: 1,
      estimatedMinDays: 1,
      estimatedMaxDays: 2,
      instructions: "Available for mapped addresses within 20 km of the warehouse.",
      isEnabled: true,
      codAllowed: true
    },
    create: {
      id: "seed-method-local-delivery",
      shippingZoneId: seattleZone.id,
      name: "Local delivery",
      description: "Same-area local delivery with COD support.",
      type: ShippingMethodType.LOCAL_DELIVERY,
      baseCost: 8,
      maximumDistanceKm: 20,
      sortOrder: 1,
      estimatedMinDays: 1,
      estimatedMaxDays: 2,
      instructions: "Available for mapped addresses within 20 km of the warehouse.",
      isEnabled: true,
      codAllowed: true
    }
  });

  const freeShippingMethod = await prisma.shippingMethod.upsert({
    where: { id: "seed-method-free-shipping" },
    update: {
      shippingZoneId: seattleZone.id,
      name: "Free shipping over 200",
      description: "Free delivery for larger local orders.",
      type: ShippingMethodType.FREE_SHIPPING,
      baseCost: 0,
      freeShippingMinimum: 200,
      sortOrder: 2,
      estimatedMinDays: 1,
      estimatedMaxDays: 2,
      instructions: "Available automatically when the cart subtotal reaches 200.",
      isEnabled: true,
      codAllowed: true
    },
    create: {
      id: "seed-method-free-shipping",
      shippingZoneId: seattleZone.id,
      name: "Free shipping over 200",
      description: "Free delivery for larger local orders.",
      type: ShippingMethodType.FREE_SHIPPING,
      baseCost: 0,
      freeShippingMinimum: 200,
      sortOrder: 2,
      estimatedMinDays: 1,
      estimatedMaxDays: 2,
      instructions: "Available automatically when the cart subtotal reaches 200.",
      isEnabled: true,
      codAllowed: true
    }
  });

  const westCoastFlatRateMethod = await prisma.shippingMethod.upsert({
    where: { id: "seed-method-west-coast-flat" },
    update: {
      shippingZoneId: westCoastZone.id,
      name: "Regional flat rate",
      description: "Flat-rate delivery across the West Coast.",
      type: ShippingMethodType.FLAT_RATE,
      baseCost: 18,
      sortOrder: 0,
      estimatedMinDays: 2,
      estimatedMaxDays: 4,
      instructions: "Tracked regional shipping.",
      isEnabled: true,
      codAllowed: false
    },
    create: {
      id: "seed-method-west-coast-flat",
      shippingZoneId: westCoastZone.id,
      name: "Regional flat rate",
      description: "Flat-rate delivery across the West Coast.",
      type: ShippingMethodType.FLAT_RATE,
      baseCost: 18,
      sortOrder: 0,
      estimatedMinDays: 2,
      estimatedMaxDays: 4,
      instructions: "Tracked regional shipping.",
      isEnabled: true,
      codAllowed: false
    }
  });

  const westCoastWeightMethod = await prisma.shippingMethod.upsert({
    where: { id: "seed-method-west-coast-weight" },
    update: {
      shippingZoneId: westCoastZone.id,
      name: "Regional weight-based",
      description: "Weight-based delivery for heavier trade orders.",
      type: ShippingMethodType.WEIGHT_BASED,
      baseCost: 22,
      sortOrder: 1,
      estimatedMinDays: 2,
      estimatedMaxDays: 5,
      instructions: "Uses tiered delivery costs based on cart weight.",
      isEnabled: true,
      codAllowed: false
    },
    create: {
      id: "seed-method-west-coast-weight",
      shippingZoneId: westCoastZone.id,
      name: "Regional weight-based",
      description: "Weight-based delivery for heavier trade orders.",
      type: ShippingMethodType.WEIGHT_BASED,
      baseCost: 22,
      sortOrder: 1,
      estimatedMinDays: 2,
      estimatedMaxDays: 5,
      instructions: "Uses tiered delivery costs based on cart weight.",
      isEnabled: true,
      codAllowed: false
    }
  });

  const domesticPriceMethod = await prisma.shippingMethod.upsert({
    where: { id: "seed-method-domestic-price" },
    update: {
      shippingZoneId: domesticZone.id,
      name: "Domestic price-based",
      description: "Fallback delivery rate based on cart value.",
      type: ShippingMethodType.PRICE_BASED,
      baseCost: 25,
      sortOrder: 0,
      estimatedMinDays: 3,
      estimatedMaxDays: 6,
      instructions: "The cart value determines the shipping band.",
      isEnabled: true,
      codAllowed: false
    },
    create: {
      id: "seed-method-domestic-price",
      shippingZoneId: domesticZone.id,
      name: "Domestic price-based",
      description: "Fallback delivery rate based on cart value.",
      type: ShippingMethodType.PRICE_BASED,
      baseCost: 25,
      sortOrder: 0,
      estimatedMinDays: 3,
      estimatedMaxDays: 6,
      instructions: "The cart value determines the shipping band.",
      isEnabled: true,
      codAllowed: false
    }
  });

  await prisma.shippingRateTier.deleteMany({
    where: {
      shippingMethodId: {
        in: [westCoastWeightMethod.id, domesticPriceMethod.id, localDeliveryMethod.id]
      }
    }
  });

  await prisma.shippingRateTier.createMany({
    data: [
      {
        shippingMethodId: westCoastWeightMethod.id,
        label: "Up to 20 kg",
        minimumValue: 0,
        maximumValue: 20,
        cost: 18,
        sortOrder: 0
      },
      {
        shippingMethodId: westCoastWeightMethod.id,
        label: "20 to 40 kg",
        minimumValue: 20.01,
        maximumValue: 40,
        cost: 24,
        sortOrder: 1
      },
      {
        shippingMethodId: westCoastWeightMethod.id,
        label: "40 kg and above",
        minimumValue: 40.01,
        maximumValue: null,
        cost: 32,
        sortOrder: 2
      },
      {
        shippingMethodId: domesticPriceMethod.id,
        label: "Orders under 100",
        minimumValue: 0,
        maximumValue: 99.99,
        cost: 25,
        sortOrder: 0
      },
      {
        shippingMethodId: domesticPriceMethod.id,
        label: "Orders 100 to 250",
        minimumValue: 100,
        maximumValue: 249.99,
        cost: 18,
        sortOrder: 1
      },
      {
        shippingMethodId: domesticPriceMethod.id,
        label: "Orders 250 and above",
        minimumValue: 250,
        maximumValue: null,
        cost: 12,
        sortOrder: 2
      },
      {
        shippingMethodId: localDeliveryMethod.id,
        label: "Within 10 km",
        minimumValue: 0,
        maximumValue: 10,
        cost: 6,
        sortOrder: 0
      },
      {
        shippingMethodId: localDeliveryMethod.id,
        label: "10 to 20 km",
        minimumValue: 10.01,
        maximumValue: 20,
        cost: 8,
        sortOrder: 1
      }
    ]
  });

  await prisma.paymentMethodSetting.upsert({
    where: { gateway: PaymentGateway.STRIPE },
    update: {
      displayName: "Stripe",
      instructions: "Enable and add keys from the admin settings page to use Stripe Checkout.",
      isEnabled: false,
      mode: GatewayMode.SANDBOX,
      publicKey: null,
      secretKey: null,
      webhookSecret: null,
      extraFee: 0,
      allowedShippingMethodTypes: [],
      allowedZoneIds: []
    },
    create: {
      gateway: PaymentGateway.STRIPE,
      displayName: "Stripe",
      instructions: "Enable and add keys from the admin settings page to use Stripe Checkout.",
      isEnabled: false,
      mode: GatewayMode.SANDBOX,
      publicKey: null,
      secretKey: null,
      webhookSecret: null,
      extraFee: 0,
      allowedShippingMethodTypes: [],
      allowedZoneIds: []
    }
  });

  await prisma.paymentMethodSetting.upsert({
    where: { gateway: PaymentGateway.PAYPAL },
    update: {
      displayName: "PayPal",
      instructions: "Enable and add API credentials from the admin settings page to use PayPal.",
      isEnabled: false,
      mode: GatewayMode.SANDBOX,
      publicKey: null,
      secretKey: null,
      webhookSecret: null,
      extraFee: 0,
      allowedShippingMethodTypes: [],
      allowedZoneIds: []
    },
    create: {
      gateway: PaymentGateway.PAYPAL,
      displayName: "PayPal",
      instructions: "Enable and add API credentials from the admin settings page to use PayPal.",
      isEnabled: false,
      mode: GatewayMode.SANDBOX,
      publicKey: null,
      secretKey: null,
      webhookSecret: null,
      extraFee: 0,
      allowedShippingMethodTypes: [],
      allowedZoneIds: []
    }
  });

  await prisma.paymentMethodSetting.upsert({
    where: { gateway: PaymentGateway.CASH_ON_DELIVERY },
    update: {
      displayName: "Cash on delivery",
      instructions: "Pay the courier when the order arrives.",
      isEnabled: true,
      mode: GatewayMode.SANDBOX,
      publicKey: null,
      secretKey: null,
      webhookSecret: null,
      extraFee: 0,
      maximumOrderAmount: 500,
      allowedShippingMethodTypes: [ShippingMethodType.LOCAL_DELIVERY, ShippingMethodType.FREE_SHIPPING],
      allowedZoneIds: [seattleZone.id]
    },
    create: {
      gateway: PaymentGateway.CASH_ON_DELIVERY,
      displayName: "Cash on delivery",
      instructions: "Pay the courier when the order arrives.",
      isEnabled: true,
      mode: GatewayMode.SANDBOX,
      publicKey: null,
      secretKey: null,
      webhookSecret: null,
      extraFee: 0,
      maximumOrderAmount: 500,
      allowedShippingMethodTypes: [ShippingMethodType.LOCAL_DELIVERY, ShippingMethodType.FREE_SHIPPING],
      allowedZoneIds: [seattleZone.id]
    }
  });
  const defaultKitchen = await prisma.kitchen.upsert({
    where: { slug: DEFAULT_CLOUD_KITCHEN_SLUG },
    update: {
      name: DEFAULT_CLOUD_KITCHEN_NAME,
      description: "Fresh Sri Lankan meals, snacks, and drinks prepared for fast local delivery.",
      phone: "+44 20 7946 0123",
      email: "orders@ceylontaste.example",
      addressLine1: DEFAULT_CLOUD_KITCHEN_LOCATION.addressLine1,
      addressLine2: null,
      city: DEFAULT_CLOUD_KITCHEN_LOCATION.city,
      state: DEFAULT_CLOUD_KITCHEN_LOCATION.state,
      postalCode: DEFAULT_CLOUD_KITCHEN_LOCATION.postalCode,
      country: DEFAULT_CLOUD_KITCHEN_LOCATION.country,
      latitude: DEFAULT_CLOUD_KITCHEN_LOCATION.latitude,
      longitude: DEFAULT_CLOUD_KITCHEN_LOCATION.longitude,
      maxDeliveryDistanceKm: CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryRadiusKm,
      minimumOrderAmount: 12,
      deliveryFee: CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryFee,
      freeDeliveryMinimum: 45,
      preparationTimeMins: CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryTimeMinMins,
      isActive: true,
      acceptsOrders: true,
      sortOrder: 0
    },
    create: {
      slug: DEFAULT_CLOUD_KITCHEN_SLUG,
      name: DEFAULT_CLOUD_KITCHEN_NAME,
      description: "Fresh Sri Lankan meals, snacks, and drinks prepared for fast local delivery.",
      phone: "+44 20 7946 0123",
      email: "orders@ceylontaste.example",
      addressLine1: DEFAULT_CLOUD_KITCHEN_LOCATION.addressLine1,
      addressLine2: null,
      city: DEFAULT_CLOUD_KITCHEN_LOCATION.city,
      state: DEFAULT_CLOUD_KITCHEN_LOCATION.state,
      postalCode: DEFAULT_CLOUD_KITCHEN_LOCATION.postalCode,
      country: DEFAULT_CLOUD_KITCHEN_LOCATION.country,
      latitude: DEFAULT_CLOUD_KITCHEN_LOCATION.latitude,
      longitude: DEFAULT_CLOUD_KITCHEN_LOCATION.longitude,
      maxDeliveryDistanceKm: CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryRadiusKm,
      minimumOrderAmount: 12,
      deliveryFee: CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryFee,
      freeDeliveryMinimum: 45,
      preparationTimeMins: CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryTimeMinMins,
      isActive: true,
      acceptsOrders: true,
      sortOrder: 0
    }
  });

  const foodCategoryRecords = await Promise.all(
    DEFAULT_FOOD_CATEGORIES.map((category) =>
      prisma.foodCategory.upsert({
        where: { slug: category.slug },
        update: {
          name: category.name,
          description: category.description,
          sortOrder: category.sortOrder,
          isActive: true
        },
        create: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          sortOrder: category.sortOrder,
          isActive: true
        }
      })
    )
  );

  const foodsData: SeedFoodItem[] = [
    {
      name: "Chicken Kottu",
      slug: "chicken-kottu",
      categorySlug: "meals",
      shortDescription: "Shredded roti stir-fried with chicken, vegetables, and house spices.",
      description: "A classic Sri Lankan street-food favorite made with chopped godamba roti, tender chicken, egg, leeks, carrots, curry gravy, and a smoky wok finish.",
      imageUrl: "https://images.unsplash.com/photo-1512058564366-c9e3e0467b79?auto=format&fit=crop&w=1200&q=80",
      price: 11.99,
      compareAtPrice: 13.5,
      isFeatured: true,
      sortOrder: 0,
      preparationTimeMins: 20
    },
    {
      name: "Cheese Kottu",
      slug: "cheese-kottu",
      categorySlug: "meals",
      shortDescription: "Creamy, spicy kottu folded with mozzarella-style cheese.",
      description: "A rich, crowd-pleasing kottu packed with chopped roti, vegetables, egg, curry seasoning, and melted cheese for extra comfort.",
      imageUrl: "https://images.unsplash.com/photo-1512058564366-c9e3e0467b79?auto=format&fit=crop&w=1200&q=80&sat=-5",
      price: 12.5,
      compareAtPrice: 14,
      sortOrder: 1,
      preparationTimeMins: 20
    },
    {
      name: "Lamprais Meal",
      slug: "lamprais-meal",
      categorySlug: "meals",
      shortDescription: "Banana-leaf-inspired rice meal with mixed meat curry and sambols.",
      description: "A hearty lamprais-style meal with rice, chicken curry, frikkadel, brinjal moju, seeni sambol, and a slow-cooked gravy profile inspired by Colombo lunch packets.",
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      price: 14.99,
      compareAtPrice: 16.5,
      isFeatured: true,
      sortOrder: 2,
      preparationTimeMins: 25
    },
    {
      name: "Chicken Roll",
      slug: "chicken-roll",
      categorySlug: "foods",
      shortDescription: "Crispy breadcrumb-coated roll with curried chicken filling.",
      description: "Golden-fried Sri Lankan roll filled with spiced potato, shredded chicken, onions, and herbs. Ideal as a tea-time snack or side.",
      imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
      price: 2.5,
      compareAtPrice: 3,
      sortOrder: 0,
      preparationTimeMins: 10
    },
    {
      name: "Fish Roll",
      slug: "fish-roll",
      categorySlug: "foods",
      shortDescription: "Crisp roll packed with tuna, potato, spices, and fresh herbs.",
      description: "A classic bakery-style fish roll with spiced tuna filling, soft potato center, and a crunchy breadcrumb shell.",
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
      price: 2.75,
      compareAtPrice: 3.25,
      sortOrder: 1,
      preparationTimeMins: 10
    },
    {
      name: "Vegetable Roll",
      slug: "vegetable-roll",
      categorySlug: "foods",
      shortDescription: "Crispy snack roll with seasoned potato and vegetable filling.",
      description: "A vegetarian Sri Lankan roll with mashed potato, leeks, carrots, curry leaves, and green chili wrapped and crumb-fried until crisp.",
      imageUrl: "https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=1200&q=80",
      price: 2.25,
      sortOrder: 2,
      preparationTimeMins: 10
    },
    {
      name: "Cream Soda",
      slug: "cream-soda",
      categorySlug: "beverages",
      shortDescription: "Chilled bright-green cream soda, a Sri Lankan favorite.",
      description: "Served ice cold for the classic pairing with kottu, rolls, and spicy lunch meals.",
      imageUrl: "https://images.unsplash.com/photo-1543253687-c931c8e01820?auto=format&fit=crop&w=1200&q=80",
      price: 2.5,
      sortOrder: 0,
      preparationTimeMins: 5
    },
    {
      name: "Iced Milo",
      slug: "iced-milo",
      categorySlug: "beverages",
      shortDescription: "Cold chocolate malt drink blended smooth and creamy.",
      description: "A sweet chilled Milo drink that works well with both spicy meals and evening snack orders.",
      imageUrl: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=1200&q=80",
      price: 3.75,
      sortOrder: 1,
      preparationTimeMins: 5
    },
    {
      name: "Kottu Night Combo",
      slug: "kottu-night-combo",
      categorySlug: "combo-packs",
      shortDescription: "A value combo built for two kottu lovers.",
      description: "A ready-to-share bundle designed for dinner service with mains, snacks, and drinks at a better bundled price.",
      imageUrl: "https://images.unsplash.com/photo-1512058564366-c9e3e0467b79?auto=format&fit=crop&w=1200&q=80&blend=000000&bm=softlight",
      price: 26.99,
      compareAtPrice: 31.5,
      itemType: FoodItemType.COMBO,
      offerTitle: "Dinner combo offer",
      offerDescription: "Best for two people and one of the easiest starter offers to feature on the menu.",
      includedItemsSummary: "1 Chicken Kottu, 1 Cheese Kottu, 2 Chicken Rolls, and 2 Cream Sodas.",
      isFeatured: true,
      sortOrder: 0,
      preparationTimeMins: 25
    },
    {
      name: "Lamprais Lunch Combo",
      slug: "lamprais-lunch-combo",
      categorySlug: "combo-packs",
      shortDescription: "Lunch-ready lamprais set with snacks and drinks included.",
      description: "A fuller lunchtime bundle built around the lamprais meal for office orders and weekend family lunches.",
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80&sat=-10",
      price: 33.99,
      compareAtPrice: 39,
      itemType: FoodItemType.COMBO,
      offerTitle: "Family lunch combo",
      offerDescription: "A strong featured offer for lunch traffic with enough variety to make the menu feel complete.",
      includedItemsSummary: "2 Lamprais Meals, 2 Fish Rolls, and 2 Iced Milo drinks.",
      isFeatured: true,
      sortOrder: 1,
      preparationTimeMins: 30
    }
  ];

  const foodItems: Array<Awaited<ReturnType<typeof prisma.foodItem.upsert>>> = [];

  for (const food of foodsData) {
    const category = foodCategoryRecords.find((item) => item.slug === food.categorySlug);
    if (!category) continue;

    const record = await prisma.foodItem.upsert({
      where: { slug: food.slug },
      update: {
        kitchenId: defaultKitchen.id,
        foodCategoryId: category.id,
        name: food.name,
        shortDescription: food.shortDescription,
        description: food.description,
        imageUrl: food.imageUrl,
        price: food.price,
        compareAtPrice: food.compareAtPrice ?? null,
        itemType: food.itemType ?? FoodItemType.SINGLE,
        offerTitle: food.offerTitle ?? null,
        offerDescription: food.offerDescription ?? null,
        includedItemsSummary: food.includedItemsSummary ?? null,
        isAvailable: true,
        isFeatured: food.isFeatured ?? false,
        sortOrder: food.sortOrder ?? 0,
        preparationTimeMins: food.preparationTimeMins ?? null
      },
      create: {
        kitchenId: defaultKitchen.id,
        foodCategoryId: category.id,
        name: food.name,
        slug: food.slug,
        shortDescription: food.shortDescription,
        description: food.description,
        imageUrl: food.imageUrl,
        price: food.price,
        compareAtPrice: food.compareAtPrice ?? null,
        itemType: food.itemType ?? FoodItemType.SINGLE,
        offerTitle: food.offerTitle ?? null,
        offerDescription: food.offerDescription ?? null,
        includedItemsSummary: food.includedItemsSummary ?? null,
        isAvailable: true,
        isFeatured: food.isFeatured ?? false,
        sortOrder: food.sortOrder ?? 0,
        preparationTimeMins: food.preparationTimeMins ?? null
      }
    });

    foodItems.push(record);
  }

  const sampleOrderNumber = `WS-${new Date().getFullYear()}-0001`;
  const sampleItems = products.slice(0, 3).map(({ record, seed }, index) => {
    const quantity = index === 0 ? 4 : 2;
    const seedVariant = seed.variants?.[0];

    if (seedVariant) {
      return {
        productId: record.id,
        productName: `${record.name} - ${seedVariant.name}`,
        productSku: seedVariant.sku,
        quantity,
        unitPrice: seedVariant.wholesalePrice,
        lineTotal: seedVariant.wholesalePrice * quantity
      };
    }

    return {
      productId: record.id,
      productName: record.name,
      productSku: record.sku,
      quantity,
      unitPrice: record.wholesalePrice,
      lineTotal: Number(record.wholesalePrice) * quantity
    };
  });

  const subtotal = sampleItems.reduce((sum, item) => sum + item.lineTotal, 0);

  await prisma.order.upsert({
    where: { orderNumber: sampleOrderNumber },
    update: {
      userId: wholesaleCustomer.id,
      shippingAddressId: shippingAddress.id,
      status: OrderStatus.CONFIRMED,
      notes: "Please deliver before 10 AM service prep.",
      subtotal,
      total: subtotal,
      itemCount: sampleItems.reduce((sum, item) => sum + item.quantity, 0),
      items: {
        deleteMany: {},
        create: sampleItems
      }
    },
    create: {
      orderNumber: sampleOrderNumber,
      userId: wholesaleCustomer.id,
      shippingAddressId: shippingAddress.id,
      status: OrderStatus.CONFIRMED,
      notes: "Please deliver before 10 AM service prep.",
      subtotal,
      total: subtotal,
      itemCount: sampleItems.reduce((sum, item) => sum + item.quantity, 0),
      items: {
        create: sampleItems
      }
    }
  });

  console.log("Seed complete");
  console.log("Admin login: admin@harvestwholesale.com / Admin@12345");
  console.log("Wholesale login: buyer@sunsetbistro.com / Wholesale@12345");
  console.log("Retail login: sophia@harvesthome.com / Customer@12345");
  console.log(`Seeded ${categoryRecords.length} categories and ${products.length} products`);
  console.log(`Seeded ${foodCategoryRecords.length} food categories and ${foodItems.length} food items`);
  console.log(`Admin user: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });





