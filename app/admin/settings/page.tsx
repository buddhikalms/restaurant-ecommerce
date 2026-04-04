import Link from "next/link"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminCategoryForm } from "@/components/forms/admin-category-form"
import { AdminPaymentMethodForm } from "@/components/forms/admin-payment-method-form"
import { AdminShippingMethodForm } from "@/components/forms/admin-shipping-method-form"
import { AdminShippingZoneForm } from "@/components/forms/admin-shipping-zone-form"
import { AdminStoreSettingsForm } from "@/components/forms/admin-store-settings-form"
import { DeleteButton } from "@/components/forms/delete-button"
import { getButtonClassName } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteCategoryAction } from "@/lib/actions/admin-actions"
import { requireAdmin } from "@/lib/auth-helpers"
import { getAdminCategories } from "@/lib/data/admin"
import { getAdminCommerceSettings } from "@/lib/data/admin-commerce"

export default async function AdminSettingsPage() {
  const [user, categories, commerceSettings] = await Promise.all([
    requireAdmin(),
    getAdminCategories(),
    getAdminCommerceSettings(),
  ])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Settings"
        title="Delivery, maps, and payment controls"
        description="Manage the checkout rules the storefront uses in real time, while keeping taxonomy maintenance in the same admin workspace."
        actions={
          <Link href="/admin/products/new" className={getButtonClassName({})}>
            <span className="text-white">Add product</span>
          </Link>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
          <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
            <p className="admin-kicker">Workspace</p>
            <CardTitle className="mt-1 text-sm">Administrator details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div>
              <p className="text-sm font-semibold text-[var(--admin-foreground)]">{user.name}</p>
              <p className="mt-1 text-[0.8rem] text-[var(--admin-muted-foreground)]">
                {user.email}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3 text-[0.8rem] leading-6 text-[var(--admin-muted-foreground)]">
              Checkout, delivery, payment, and zone rules now flow from this page. Changes here refresh the storefront checkout without manual code edits.
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
          <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
            <p className="admin-kicker">Store settings</p>
            <CardTitle className="mt-1 text-sm">Delivery defaults and Google Maps</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <AdminStoreSettingsForm settings={commerceSettings.storeSettings} />
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
        <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
          <p className="admin-kicker">Payments</p>
          <CardTitle className="mt-1 text-sm">Gateway controls</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-4 xl:grid-cols-3">
          {commerceSettings.paymentMethods.map((setting) => (
            <AdminPaymentMethodForm
              key={setting.gateway}
              setting={setting}
              zones={commerceSettings.shippingZones.map((zone) => ({
                id: zone.id,
                name: zone.name,
              }))}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
        <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
          <p className="admin-kicker">Shipping zones</p>
          <CardTitle className="mt-1 text-sm">Zone matching, delivery methods, and WooCommerce-style rate tiers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4">
            <p className="text-sm font-semibold text-[var(--admin-foreground)]">Create shipping zone</p>
            <p className="mt-1 text-[0.78rem] text-[var(--admin-muted-foreground)]">
              Add a new zone, then attach flat rate, free shipping, local delivery, pickup, price-based, or weight-based methods.
            </p>
            <div className="mt-4">
              <AdminShippingZoneForm submitLabel="Create zone" />
            </div>
          </div>

          {commerceSettings.shippingZones.map((zone) => (
            <div
              key={zone.id}
              className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4"
            >
              <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
                <div>
                  <p className="text-sm font-semibold text-[var(--admin-foreground)]">{zone.name}</p>
                  <p className="mt-1 text-[0.76rem] text-[var(--admin-muted-foreground)]">
                    Update matching rules, priority, and availability for this zone.
                  </p>
                  <div className="mt-4">
                    <AdminShippingZoneForm
                      zone={{
                        id: zone.id,
                        name: zone.name,
                        description: zone.description ?? undefined,
                        isEnabled: zone.isEnabled,
                        sortOrder: zone.sortOrder,
                        regions: zone.regions.map((region) => ({
                          id: region.id,
                          country: region.country ?? undefined,
                          state: region.state ?? undefined,
                          city: region.city ?? undefined,
                          postalCodePattern: region.postalCodePattern ?? undefined,
                          sortOrder: region.sortOrder,
                        })),
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--admin-foreground)]">Delivery methods</p>
                    <p className="mt-1 text-[0.76rem] text-[var(--admin-muted-foreground)]">
                      Each method can define cost, amount and weight conditions, local distance limits, COD eligibility, and tiered variations.
                    </p>
                  </div>

                  {zone.methods.length ? (
                    zone.methods.map((method) => (
                      <AdminShippingMethodForm
                        key={method.id}
                        shippingZoneId={zone.id}
                        method={{
                          id: method.id,
                          shippingZoneId: zone.id,
                          name: method.name,
                          description: method.description ?? undefined,
                          type: method.type,
                          baseCost: method.baseCost,
                          minimumOrderAmount: method.minimumOrderAmount ?? undefined,
                          maximumOrderAmount: method.maximumOrderAmount ?? undefined,
                          minimumWeight: method.minimumWeight ?? undefined,
                          maximumWeight: method.maximumWeight ?? undefined,
                          freeShippingMinimum: method.freeShippingMinimum ?? undefined,
                          maximumDistanceKm: method.maximumDistanceKm ?? undefined,
                          sortOrder: method.sortOrder,
                          estimatedMinDays: method.estimatedMinDays ?? undefined,
                          estimatedMaxDays: method.estimatedMaxDays ?? undefined,
                          instructions: method.instructions ?? undefined,
                          isEnabled: method.isEnabled,
                          codAllowed: method.codAllowed,
                          tiers: method.tiers.map((tier) => ({
                            id: tier.id,
                            label: tier.label ?? undefined,
                            minimumValue: tier.minimumValue ?? undefined,
                            maximumValue: tier.maximumValue ?? undefined,
                            cost: tier.cost,
                            sortOrder: tier.sortOrder,
                          })),
                        }}
                      />
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 text-[0.78rem] text-[var(--admin-muted-foreground)]">
                      No delivery methods configured for this zone yet.
                    </div>
                  )}

                  <div className="rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
                    <p className="text-sm font-semibold text-[var(--admin-foreground)]">Add delivery method</p>
                    <div className="mt-4">
                      <AdminShippingMethodForm shippingZoneId={zone.id} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
        <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
          <p className="admin-kicker">Categories</p>
          <CardTitle className="mt-1 text-sm">Add and maintain product taxonomy</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4">
            <p className="text-sm font-semibold text-[var(--admin-foreground)]">Create category</p>
            <p className="mt-1 text-[0.78rem] text-[var(--admin-muted-foreground)]">
              Add a new category for use in product forms and storefront browsing.
            </p>
            <div className="mt-4">
              <AdminCategoryForm submitLabel="Create category" />
            </div>
          </div>

          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4"
              >
                <div className="mb-4 flex flex-col gap-3 border-b border-[var(--admin-border)] pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--admin-foreground)]">
                      {category.name}
                    </p>
                    <p className="mt-1 text-[0.76rem] text-[var(--admin-muted-foreground)]">
                      Slug {category.slug} - {category._count.products} linked products
                    </p>
                  </div>
                  <DeleteButton
                    itemId={category.id}
                    action={deleteCategoryAction}
                    label="Delete"
                    confirmMessage="Delete this category? It must not be linked to products."
                  />
                </div>
                <AdminCategoryForm
                  category={{
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    description: category.description ?? undefined,
                    isActive: category.isActive,
                  }}
                  submitLabel="Save category"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



