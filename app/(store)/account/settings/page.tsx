import { notFound } from "next/navigation";

import { AccountNav } from "@/components/layout/account-nav";
import { CustomerProfileSettingsForm, DefaultAddressSettingsForm } from "@/components/forms/account-settings-forms";
import { requireRetailUser } from "@/lib/auth-helpers";
import { getAccountSettings } from "@/lib/data/account";

export default async function AccountSettingsPage() {
  const user = await requireRetailUser();
  const settings = await getAccountSettings(user.id);

  if (!settings) {
    notFound();
  }

  return (
    <div className="page-shell py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Account settings</p>
          <h1 className="section-title mt-2">Profile and address</h1>
          <p className="section-copy mt-2 max-w-2xl">
            Update the contact and delivery details you use most often during checkout.
          </p>
        </div>
        <AccountNav mode="customer" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <CustomerProfileSettingsForm
          defaults={{
            name: settings.name,
            email: settings.email,
            phone: settings.phone ?? "",
            businessName: settings.businessName
          }}
        />
        <div className="space-y-4">
          <DefaultAddressSettingsForm defaults={settings.defaultAddress} mode="customer" />
          <section className="paper-panel rounded-lg p-5">
            <p className="section-label">Checkout sync</p>
            <h2 className="section-subtitle mt-2">Saved details speed up repeat orders</h2>
            <div className="mt-3 space-y-2 text-[0.82rem] leading-6 text-[var(--muted-foreground)]">
              <p>Your saved profile pre-fills the contact section at checkout.</p>
              <p>Your default shipping address appears automatically on future orders.</p>
              <p>You can still edit order-specific details at the point of purchase.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
