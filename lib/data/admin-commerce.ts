import { unstable_noStore as noStore } from "next/cache"

import { prisma } from "@/lib/prisma"
import {
  getPaymentMethodSettings,
  getStoreSettings,
} from "@/lib/settings/store-settings"

export async function getAdminCommerceSettings() {
  noStore()

  const [storeSettings, paymentMethods, shippingZones] = await Promise.all([
    getStoreSettings(),
    getPaymentMethodSettings(),
    prisma.shippingZone.findMany({
      include: {
        regions: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
        methods: {
          include: {
            tiers: {
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            },
          },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ])

  return {
    storeSettings,
    paymentMethods,
    shippingZones: shippingZones.map((zone) => ({
      ...zone,
      methods: zone.methods.map((method) => ({
        ...method,
        baseCost: Number(method.baseCost),
        minimumOrderAmount:
          method.minimumOrderAmount === null ? null : Number(method.minimumOrderAmount),
        maximumOrderAmount:
          method.maximumOrderAmount === null ? null : Number(method.maximumOrderAmount),
        minimumWeight: method.minimumWeight === null ? null : Number(method.minimumWeight),
        maximumWeight: method.maximumWeight === null ? null : Number(method.maximumWeight),
        freeShippingMinimum:
          method.freeShippingMinimum === null ? null : Number(method.freeShippingMinimum),
        maximumDistanceKm:
          method.maximumDistanceKm === null ? null : Number(method.maximumDistanceKm),
        tiers: method.tiers.map((tier) => ({
          ...tier,
          minimumValue: tier.minimumValue === null ? null : Number(tier.minimumValue),
          maximumValue: tier.maximumValue === null ? null : Number(tier.maximumValue),
          cost: Number(tier.cost),
        })),
      })),
    })),
  }
}
