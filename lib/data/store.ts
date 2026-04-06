import { unstable_noStore as noStore } from "next/cache";
import { Prisma } from "@/generated/prisma";

import { PRODUCT_PAGE_SIZE } from "@/lib/constants";
import { coerceGalleryImageUrls } from "@/lib/product-gallery";
import { calculatePriceWithVat } from "@/lib/product-pricing";
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
    vatMode: true,
    vatRate: true,
    normalPrice: true,
    wholesalePrice: true,
    stockQuantity: true,
    minOrderQuantity: true,
    isActive: true,
    variants: {
      where: {
        isActive: true,
      },
      orderBy: {
        position: "asc",
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
        position: true,
      },
    },
    category: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
  } satisfies Prisma.ProductSelect;
}

type StoreProductRecord = Prisma.ProductGetPayload<{
  select: ReturnType<typeof productSelect>;
}>;

function getProductWhere(filters: ProductFilterOptions): Prisma.ProductWhereInput {
  return {
    isActive: true,
    ...(filters.category
      ? {
          category: {
            slug: filters.category,
          },
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
                    { sku: { contains: filters.query } },
                  ],
                },
              },
            },
          ],
        }
      : {}),
  };
}

function serializeProduct(product: StoreProductRecord) {
  const vatRate = Number(product.vatRate);

  return {
    ...product,
    galleryImageUrls: coerceGalleryImageUrls(product.galleryImageUrls),
    vatRate,
    normalPrice: calculatePriceWithVat(
      product.normalPrice,
      vatRate,
      product.vatMode,
    ),
    wholesalePrice: calculatePriceWithVat(
      product.wholesalePrice,
      vatRate,
      product.vatMode,
    ),
    variants: product.variants.map((variant) => ({
      ...variant,
      normalPrice: calculatePriceWithVat(
        variant.normalPrice,
        vatRate,
        product.vatMode,
      ),
      wholesalePrice: calculatePriceWithVat(
        variant.wholesalePrice,
        vatRate,
        product.vatMode,
      ),
    })),
    category: {
      name: product.category.name,
      slug: product.category.slug,
    },
  };
}

function matchesRequestedPrice(
  product: ReturnType<typeof serializeProduct>,
  filters: ProductFilterOptions,
) {
  const activePrice =
    filters.pricingMode === "wholesale"
      ? product.wholesalePrice
      : product.normalPrice;

  if (filters.minPrice !== undefined && activePrice < filters.minPrice) {
    return false;
  }

  if (filters.maxPrice !== undefined && activePrice > filters.maxPrice) {
    return false;
  }

  return true;
}

export async function getStoreCategories() {
  noStore();

  return prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getFeaturedProducts() {
  noStore();

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: productSelect(),
    orderBy: [{ stockQuantity: "desc" }, { createdAt: "desc" }],
    take: 4,
  });

  return products.map(serializeProduct);
}

export async function getProducts(filters: ProductFilterOptions) {
  noStore();

  const page = Math.max(filters.page ?? 1, 1);
  const where = getProductWhere(filters);
  const products = await prisma.product.findMany({
    where,
    select: productSelect(),
    orderBy: [{ createdAt: "desc" }, { name: "asc" }],
  });
  const serializedProducts = products
    .map(serializeProduct)
    .filter((product) => matchesRequestedPrice(product, filters));
  const total = serializedProducts.length;
  const paginatedProducts = serializedProducts.slice(
    (page - 1) * PRODUCT_PAGE_SIZE,
    page * PRODUCT_PAGE_SIZE,
  );

  return {
    products: paginatedProducts,
    total,
    page,
    totalPages: Math.max(Math.ceil(total / PRODUCT_PAGE_SIZE), 1),
  };
}

export async function getProductBySlug(slug: string) {
  noStore();

  const product = await prisma.product.findUnique({
    where: { slug },
    select: productSelect(),
  });

  if (!product || !product.isActive) {
    return null;
  }

  return serializeProduct(product);
}

export async function getHomepageContent() {
  noStore();

  const [homepageProducts, categories, totalProducts] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: productSelect(),
      orderBy: [{ stockQuantity: "desc" }, { createdAt: "desc" }],
      take: 8,
    }),
    getStoreCategories(),
    prisma.product.count({
      where: {
        isActive: true,
      },
    }),
  ]);

  const serializedHomepageProducts = homepageProducts.map(serializeProduct);

  return {
    featuredProducts: serializedHomepageProducts.slice(0, 4),
    recommendedProducts: serializedHomepageProducts.slice(4, 8),
    categories,
    totalProducts,
  };
}
