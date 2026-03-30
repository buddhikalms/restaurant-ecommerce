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
    <div className="page-shell py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Account settings</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900">Profile and address</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Update the details you use for checkout, delivery coordination, and future repeat orders.
          </p>
        </div>
        <AccountNav mode="customer" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <CustomerProfileSettingsForm
          defaults={{
            name: settings.name,
            email: settings.email,
            phone: settings.phone ?? "",
            businessName: settings.businessName
          }}
        />
        <div className="space-y-6">
          <DefaultAddressSettingsForm defaults={settings.defaultAddress} mode="customer" />
          <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">What this affects</p>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-slate-900">Checkout stays in sync</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>Your saved profile details prefill the contact fields on checkout.</p>
              <p>Your default shipping address preloads the delivery section for faster repeat ordering.</p>
              <p>If you edit checkout details later, the latest order address can still become your new default.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
