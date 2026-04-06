import { Prisma } from "@/generated/prisma"

import { calculatePriceWithVat } from "@/lib/product-pricing"
import { prisma } from "@/lib/prisma"
import { type PricingMode } from "@/lib/user-roles"

export type CheckoutItemInput = {
  productId: string
  variantId?: string | null
  quantity: number
}

export type NormalizedCheckoutItem = {
  productId: string
  productSlug: string
  productName: string
  productSku: string
  quantity: number
  unitPrice: number
  lineTotal: number
  variantId: string | null
  weight: number
  requiresShipping: boolean
  allowStorePickup: boolean
  allowLocalDelivery: boolean
}

export type NormalizedCheckoutCart = {
  items: NormalizedCheckoutItem[]
  subtotal: number
  itemCount: number
  totalWeight: number
  requiresShipping: boolean
  allowStorePickup: boolean
  allowLocalDelivery: boolean
}

export async function normalizeCheckoutCartItems({
  items,
  pricingMode,
}: {
  items: CheckoutItemInput[]
  pricingMode: PricingMode
}): Promise<NormalizedCheckoutCart> {
  const uniqueProductIds = [...new Set(items.map((item) => item.productId))]
  const products = await prisma.product.findMany({
    where: {
      id: { in: uniqueProductIds },
      isActive: true,
    },
    include: {
      variants: {
        where: {
          isActive: true,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  })

  if (products.length !== uniqueProductIds.length) {
    throw new Error("One or more items in your cart are no longer available.")
  }

  const productMap = new Map(products.map((product) => [product.id, product]))

  const normalizedItems = items.map((item) => {
    const product = productMap.get(item.productId)

    if (!product) {
      throw new Error("Product not found")
    }

    const selectedVariant = item.variantId
      ? product.variants.find((variant) => variant.id === item.variantId) ?? null
      : null

    if (product.productType === "VARIABLE" && !selectedVariant) {
      throw new Error(
        `${product.name} requires a valid ${product.variantLabel?.toLowerCase() || "option"} selection.`,
      )
    }

    if (product.productType === "SIMPLE" && item.variantId) {
      throw new Error(`${product.name} is no longer configured with variable options.`)
    }

    const pricingSource = selectedVariant ?? product
    const minimumQuantity = pricingMode === "wholesale" ? pricingSource.minOrderQuantity : 1
    const unitPrice = calculatePriceWithVat(
      pricingMode === "wholesale" ? pricingSource.wholesalePrice : pricingSource.normalPrice,
      Number(product.vatRate),
      product.vatMode,
    )
    const stockQuantity = pricingSource.stockQuantity
    const productName = selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name
    const productSku = selectedVariant?.sku ?? product.sku

    if (item.quantity < minimumQuantity) {
      throw new Error(
        pricingMode === "wholesale"
          ? `${productName} requires a wholesale minimum quantity of ${pricingSource.minOrderQuantity}.`
          : `${productName} requires a quantity of at least 1.`,
      )
    }

    if (item.quantity > stockQuantity) {
      throw new Error(`${productName} does not have enough stock available.`)
    }

    return {
      productId: product.id,
      productSlug: product.slug,
      productName,
      productSku,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      variantId: selectedVariant?.id ?? null,
      weight: Number(product.weight) * item.quantity,
      requiresShipping: product.requiresShipping,
      allowStorePickup: product.allowStorePickup,
      allowLocalDelivery: product.allowLocalDelivery,
    } satisfies NormalizedCheckoutItem
  })

  return {
    items: normalizedItems,
    subtotal: normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0),
    itemCount: normalizedItems.reduce((sum, item) => sum + item.quantity, 0),
    totalWeight: normalizedItems.reduce((sum, item) => sum + item.weight, 0),
    requiresShipping: normalizedItems.some((item) => item.requiresShipping),
    allowStorePickup: normalizedItems.every((item) => item.allowStorePickup),
    allowLocalDelivery: normalizedItems.every((item) => item.allowLocalDelivery),
  }
}

export async function decrementInventoryForCheckoutItems(
  tx: Prisma.TransactionClient,
  items: NormalizedCheckoutItem[],
) {
  const variableProductIdsToSync = new Set<string>()

  for (const item of items) {
    if (item.variantId) {
      const updatedVariant = await tx.productVariant.updateMany({
        where: {
          id: item.variantId,
          stockQuantity: {
            gte: item.quantity,
          },
        },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      })

      if (!updatedVariant.count) {
        throw new Error(`${item.productName} no longer has enough stock available.`)
      }

      variableProductIdsToSync.add(item.productId)
      continue
    }

    const updatedProduct = await tx.product.updateMany({
      where: {
        id: item.productId,
        stockQuantity: {
          gte: item.quantity,
        },
      },
      data: {
        stockQuantity: {
          decrement: item.quantity,
        },
      },
    })

    if (!updatedProduct.count) {
      throw new Error(`${item.productName} no longer has enough stock available.`)
    }
  }

  for (const productId of variableProductIdsToSync) {
    const variants = await tx.productVariant.findMany({
      where: {
        productId,
        isActive: true,
      },
      select: {
        normalPrice: true,
        wholesalePrice: true,
        stockQuantity: true,
        minOrderQuantity: true,
        isActive: true,
      },
    })

    if (!variants.length) {
      continue
    }

    const normalPrices = variants.map((variant) => Number(variant.normalPrice))
    const wholesalePrices = variants.map((variant) => Number(variant.wholesalePrice))
    const minOrderQuantities = variants.map((variant) => variant.minOrderQuantity)
    const stockQuantities = variants.map((variant) => variant.stockQuantity)

    await tx.product.update({
      where: { id: productId },
      data: {
        normalPrice: Math.min(...normalPrices),
        wholesalePrice: Math.min(...wholesalePrices),
        minOrderQuantity: Math.min(...minOrderQuantities),
        stockQuantity: stockQuantities.reduce((sum, value) => sum + value, 0),
      },
    })
  }
}
