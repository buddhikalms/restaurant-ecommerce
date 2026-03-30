import { unstable_noStore as noStore } from "next/cache";
import { Prisma } from "prisma-generated-client-v2";

import { PRODUCT_PAGE_SIZE } from "@/lib/constants";
import { coerceGalleryImageUrls } from "@/lib/product-gallery";
import { prisma } from "@/lib/prisma";
import { type PricingMode } from "@/lib/user-roles";

type ProductFilterOptions = {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pricingMode?: PricingMode;
};

function productSelect() {
  return {
    id: true,
    name: true,
    slug: true,
    sku: true,
    description: true,
    information: true,
    ingredients: true,
    nutritional: true,
    faq: true,
    imageUrl: true,
    galleryImageUrls: true,
    productType: true,
    variantLabel: true,
    normalPrice: true,
    wholesalePrice: true,
    stockQuantity: true,
    minOrderQuantity: true,
    isActive: true,
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
        stockQuantity: true,
        minOrderQuantity: true,
        isActive: true,
        position: true
      }
    },
    category: {
      select: {
        id: true,
        name: true,
        slug: true
      }
    }
  } satisfies Prisma.ProductSelect;
}

type StoreProductRecord = Prisma.ProductGetPayload<{
  select: ReturnType<typeof productSelect>;
}>;

function getProductWhere(filters: ProductFilterOptions): Prisma.ProductWhereInput {
  const priceField = filters.pricingMode === "wholesale" ? "wholesalePrice" : "normalPrice";
  const priceFilter =
    filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? ({
          [priceField]: {
            ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {})
          }
        } as Prisma.ProductWhereInput)
      : {};

  return {
    isActive: true,
    ...(filters.category
      ? {
          category: {
            slug: filters.category
          }
        }
      : {}),
    ...(filters.query
      ? {
          OR: [
            { name: { contains: filters.query } },
            { sku: { contains: filters.query } },
            { description: { contains: filters.query } },
            {
              variants: {
                some: {
                  isActive: true,
                  OR: [
                    { name: { contains: filters.query } },
                    { sku: { contains: filters.query } }
                  ]
                }
              }
            }
          ]
        }
      : {}),
    ...priceFilter
  };
}

function serializeProduct(product: StoreProductRecord) {
  return {
    ...product,
    galleryImageUrls: coerceGalleryImageUrls(product.galleryImageUrls),
    normalPrice: Number(product.normalPrice),
    wholesalePrice: Number(product.wholesalePrice),
    variants: product.variants.map((variant) => ({
      ...variant,
      normalPrice: Number(variant.normalPrice),
      wholesalePrice: Number(variant.wholesalePrice)
    })),
    category: {
      name: product.category.name,
      slug: product.category.slug
    }
  };
}

export async function getStoreCategories() {
  noStore();

  return prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: "asc" }
  });
}

export async function getFeaturedProducts() {
  noStore();

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: productSelect(),
    orderBy: [{ stockQuantity: "desc" }, { createdAt: "desc" }],
    take: 3
  });

  return products.map(serializeProduct);
}

export async function getProducts(filters: ProductFilterOptions) {
  noStore();

  const page = Math.max(filters.page ?? 1, 1);
  const where = getProductWhere(filters);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productSelect(),
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
      take: PRODUCT_PAGE_SIZE,
      skip: (page - 1) * PRODUCT_PAGE_SIZE
    }),
    prisma.product.count({ where })
  ]);

  return {
    products: products.map(serializeProduct),
    total,
    page,
    totalPages: Math.max(Math.ceil(total / PRODUCT_PAGE_SIZE), 1)
  };
}

export async function getProductBySlug(slug: string) {
  noStore();

  const product = await prisma.product.findUnique({
    where: { slug },
    select: productSelect()
  });

  if (!product || !product.isActive) {
    return null;
  }

  return serializeProduct(product);
}

export async function getHomepageContent() {
  noStore();

  const [featuredProducts, categories, totalProducts] = await Promise.all([
    getFeaturedProducts(),
    getStoreCategories(),
    prisma.product.count({
      where: {
        isActive: true
      }
    })
  ]);

  return {
    featuredProducts,
    categories,
    totalProducts
  };
}
