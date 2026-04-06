import { ShippingMethodType, type Prisma } from "@/generated/prisma"

import { type NormalizedCheckoutCart } from "@/lib/checkout/cart"
import { prisma } from "@/lib/prisma"
import { getStoreSettings } from "@/lib/settings/store-settings"

export type CheckoutAddress = {
  line1: string
  line2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
  latitude?: number | null
  longitude?: number | null
  placeId?: string | null
}

export type ResolvedShippingZone = {
  id: string
  name: string
  description: string | null
}

export type AvailableShippingMethod = {
  id: string
  zoneId: string
  zoneName: string
  name: string
  description: string | null
  type: ShippingMethodType
  cost: number
  estimatedMinDays: number | null
  estimatedMaxDays: number | null
  instructions: string | null
  codAllowed: boolean
  distanceKm: number | null
}

function normalizeValue(value?: string | null) {
  return value?.trim().toLowerCase() ?? ""
}

function splitPatterns(value?: string | null) {
  return (value ?? "")
    .split(/[\n,]+/)
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
}

function matchesTextPattern(pattern: string, candidate: string) {
  const escapedPattern = pattern.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace(/\*/g, ".*")
  return new RegExp(`^${escapedPattern}$`, "i").test(candidate)
}

function matchesListValue(patterns: string[], candidate: string) {
  if (!patterns.length) {
    return true
  }

  return patterns.some((pattern) => matchesTextPattern(pattern, candidate))
}

function matchesPostalCode(patterns: string[], postalCode: string) {
  if (!patterns.length) {
    return true
  }

  const normalizedPostalCode = normalizeValue(postalCode)
  return patterns.some((pattern) => matchesTextPattern(pattern, normalizedPostalCode))
}

function getSpecificityScore(region: {
  country: string | null
  state: string | null
  city: string | null
  postalCodePattern: string | null
}) {
  return [region.country, region.state, region.city, region.postalCodePattern].filter(Boolean).length
}

function toNumber(value: Prisma.Decimal | number | null | undefined) {
  return value === null || value === undefined ? null : Number(value)
}

function withinOptionalRange({
  value,
  min,
  max,
}: {
  value: number
  min?: number | null
  max?: number | null
}) {
  if (min !== null && min !== undefined && value < min) {
    return false
  }

  if (max !== null && max !== undefined && value > max) {
    return false
  }

  return true
}

function getDistanceKm(
  origin?: { latitude?: number | null; longitude?: number | null },
  destination?: { latitude?: number | null; longitude?: number | null },
) {
  if (
    origin?.latitude === null ||
    origin?.latitude === undefined ||
    origin?.longitude === null ||
    origin?.longitude === undefined ||
    destination?.latitude === null ||
    destination?.latitude === undefined ||
    destination?.longitude === null ||
    destination?.longitude === undefined
  ) {
    return null
  }

  const toRadians = (value: number) => (value * Math.PI) / 180
  const earthRadiusKm = 6371
  const latitudeDelta = toRadians(destination.latitude - origin.latitude)
  const longitudeDelta = toRadians(destination.longitude - origin.longitude)
  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(toRadians(origin.latitude)) *
      Math.cos(toRadians(destination.latitude)) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2)

  return Math.round(earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 100) / 100
}

function resolveTierCost({
  tiers,
  metric,
}: {
  tiers: Array<{
    minimumValue: Prisma.Decimal | null
    maximumValue: Prisma.Decimal | null
    cost: Prisma.Decimal
  }>
  metric: number
}) {
  const matchingTier = tiers.find((tier) =>
    withinOptionalRange({
      value: metric,
      min: toNumber(tier.minimumValue),
      max: toNumber(tier.maximumValue),
    }),
  )

  return matchingTier ? Number(matchingTier.cost) : null
}

export async function resolveShippingZone(address: CheckoutAddress) {
  const zones = await prisma.shippingZone.findMany({
    where: {
      isEnabled: true,
    },
    include: {
      regions: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })

  const normalizedAddress = {
    country: normalizeValue(address.country),
    state: normalizeValue(address.state),
    city: normalizeValue(address.city),
    postalCode: normalizeValue(address.postalCode),
  }

  const matches = zones.flatMap((zone) => {
    if (!zone.regions.length) {
      return [
        {
          zone,
          specificity: 0,
        },
      ]
    }

    const specificity = Math.max(
      ...zone.regions
        .filter((region) => {
          const countries = splitPatterns(region.country)
          const states = splitPatterns(region.state)
          const cities = splitPatterns(region.city)
          const postalCodes = splitPatterns(region.postalCodePattern)

          return (
            matchesListValue(countries, normalizedAddress.country) &&
            matchesListValue(states, normalizedAddress.state) &&
            matchesListValue(cities, normalizedAddress.city) &&
            matchesPostalCode(postalCodes, normalizedAddress.postalCode)
          )
        })
        .map(getSpecificityScore),
      -1,
    )

    if (specificity < 0) {
      return []
    }

    return [
      {
        zone,
        specificity,
      },
    ]
  })

  if (!matches.length) {
    return null
  }

  // Prefer the most specific matching zone, then fall back to admin-defined priority.
  matches.sort((left, right) => {
    if (right.specificity !== left.specificity) {
      return right.specificity - left.specificity
    }

    if (left.zone.sortOrder !== right.zone.sortOrder) {
      return left.zone.sortOrder - right.zone.sortOrder
    }

    return left.zone.createdAt.getTime() - right.zone.createdAt.getTime()
  })

  const bestMatch = matches[0]?.zone

  if (!bestMatch) {
    return null
  }

  return {
    id: bestMatch.id,
    name: bestMatch.name,
    description: bestMatch.description,
  } satisfies ResolvedShippingZone
}

export async function calculateShippingCost(
  cart: NormalizedCheckoutCart,
  methodId: string,
  address: CheckoutAddress,
) {
  const storeSettings = await getStoreSettings()
  const method = await prisma.shippingMethod.findUnique({
    where: { id: methodId },
    include: {
      tiers: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  })

  if (!method || !method.isEnabled) {
    throw new Error("The selected shipping method is no longer available.")
  }

  const distanceKm = getDistanceKm(
    {
      latitude: storeSettings.storeLatitude,
      longitude: storeSettings.storeLongitude,
    },
    {
      latitude: address.latitude,
      longitude: address.longitude,
    },
  )

  switch (method.type) {
    case ShippingMethodType.FREE_SHIPPING:
      if (
        method.freeShippingMinimum !== null &&
        cart.subtotal < Number(method.freeShippingMinimum)
      ) {
        throw new Error("This order does not meet the free shipping threshold.")
      }

      return 0
    case ShippingMethodType.WEIGHT_BASED: {
      const tierCost = resolveTierCost({ tiers: method.tiers, metric: cart.totalWeight })
      if (tierCost !== null) {
        return tierCost
      }

      return Number(method.baseCost)
    }
    case ShippingMethodType.PRICE_BASED: {
      const tierCost = resolveTierCost({ tiers: method.tiers, metric: cart.subtotal })
      if (tierCost !== null) {
        return tierCost
      }

      return Number(method.baseCost)
    }
    case ShippingMethodType.LOCAL_DELIVERY: {
      if (method.maximumDistanceKm !== null) {
        if (distanceKm === null) {
          throw new Error("A mappable address is required for local delivery.")
        }

        if (distanceKm > Number(method.maximumDistanceKm)) {
          throw new Error("The delivery address is outside the local delivery area.")
        }
      }

      if (distanceKm !== null) {
        const tierCost = resolveTierCost({ tiers: method.tiers, metric: distanceKm })
        if (tierCost !== null) {
          return tierCost
        }
      }

      return Number(method.baseCost)
    }
    case ShippingMethodType.STORE_PICKUP:
    case ShippingMethodType.FLAT_RATE:
      return Number(method.baseCost)
    default:
      return Number(method.baseCost)
  }
}

export async function getAvailableShippingMethods(
  cart: NormalizedCheckoutCart,
  address: CheckoutAddress,
) {
  const storeSettings = await getStoreSettings()
  const zone = await resolveShippingZone(address)

  if (!zone) {
    return {
      zone: null,
      handlingFee: storeSettings.defaultHandlingFee,
      methods: [] as AvailableShippingMethod[],
    }
  }

  const shippingMethods = await prisma.shippingMethod.findMany({
    where: {
      shippingZoneId: zone.id,
      isEnabled: true,
    },
    include: {
      tiers: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })

  const distanceKm = getDistanceKm(
    {
      latitude: storeSettings.storeLatitude,
      longitude: storeSettings.storeLongitude,
    },
    {
      latitude: address.latitude,
      longitude: address.longitude,
    },
  )

  const methods = shippingMethods.flatMap((method) => {
    if (
      !withinOptionalRange({
        value: cart.subtotal,
        min: toNumber(method.minimumOrderAmount),
        max: toNumber(method.maximumOrderAmount),
      })
    ) {
      return []
    }

    if (
      !withinOptionalRange({
        value: cart.totalWeight,
        min: toNumber(method.minimumWeight),
        max: toNumber(method.maximumWeight),
      })
    ) {
      return []
    }

    if (method.type === ShippingMethodType.STORE_PICKUP && !cart.allowStorePickup) {
      return []
    }

    if (method.type === ShippingMethodType.LOCAL_DELIVERY && !cart.allowLocalDelivery) {
      return []
    }

    if (
      method.type === ShippingMethodType.FREE_SHIPPING &&
      method.freeShippingMinimum !== null &&
      cart.subtotal < Number(method.freeShippingMinimum)
    ) {
      return []
    }

    if (
      method.type === ShippingMethodType.LOCAL_DELIVERY &&
      method.maximumDistanceKm !== null &&
      (distanceKm === null || distanceKm > Number(method.maximumDistanceKm))
    ) {
      return []
    }

    const cost = (() => {
      switch (method.type) {
        case ShippingMethodType.FREE_SHIPPING:
          return 0
        case ShippingMethodType.WEIGHT_BASED:
          return resolveTierCost({ tiers: method.tiers, metric: cart.totalWeight }) ?? Number(method.baseCost)
        case ShippingMethodType.PRICE_BASED:
          return resolveTierCost({ tiers: method.tiers, metric: cart.subtotal }) ?? Number(method.baseCost)
        case ShippingMethodType.LOCAL_DELIVERY:
          if (distanceKm !== null) {
            return resolveTierCost({ tiers: method.tiers, metric: distanceKm }) ?? Number(method.baseCost)
          }

          return Number(method.baseCost)
        case ShippingMethodType.STORE_PICKUP:
        case ShippingMethodType.FLAT_RATE:
        default:
          return Number(method.baseCost)
      }
    })()

    return [
      {
        id: method.id,
        zoneId: zone.id,
        zoneName: zone.name,
        name: method.name,
        description: method.description,
        type: method.type,
        cost,
        estimatedMinDays: method.estimatedMinDays,
        estimatedMaxDays: method.estimatedMaxDays,
        instructions: method.instructions,
        codAllowed: method.codAllowed,
        distanceKm,
      } satisfies AvailableShippingMethod,
    ]
  })

  return {
    zone,
    handlingFee: storeSettings.defaultHandlingFee,
    methods,
  }
}


