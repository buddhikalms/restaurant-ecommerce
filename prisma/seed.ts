import { PrismaClient, Role, OrderStatus, ProductType } from "prisma-generated-client-v2";
import { hash } from "bcryptjs";

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

