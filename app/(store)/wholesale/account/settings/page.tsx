import { notFound } from "next/navigation";

import {
  DefaultAddressSettingsForm,
  WholesaleBusinessSettingsForm,
  WholesaleContactSettingsForm,
} from "@/components/forms/account-settings-forms";
import { AccountNav } from "@/components/layout/account-nav";
import { requireWholesaleUser } from "@/lib/auth-helpers";
import { getAccountSettings } from "@/lib/data/account";

type WholesaleSettings = NonNullable<Awaited<ReturnType<typeof getAccountSettings>>>;

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? "Wholesale",
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : "Buyer",
  };
}

function buildWholesaleProfileDefaults(settings: WholesaleSettings) {
  const wholesaleProfile = settings.wholesaleProfile;
  const defaultAddress = settings.defaultAddress;
  const fallbackName = splitName(settings.name);

  return {
    firstName: wholesaleProfile?.firstName ?? fallbackName.firstName,
    lastName: wholesaleProfile?.lastName ?? fallbackName.lastName,
    mobileNumber: wholesaleProfile?.mobileNumber ?? settings.phone ?? "",
    telephoneNumber:
      wholesaleProfile?.telephoneNumber ?? settings.phone ?? "",
    tradingName: wholesaleProfile?.tradingName ?? settings.businessName ?? "",
    deliveryAddressLine1:
      wholesaleProfile?.deliveryAddressLine1 ?? defaultAddress?.line1 ?? "",
    deliveryAddressLine2:
      wholesaleProfile?.deliveryAddressLine2 ?? defaultAddress?.line2 ?? "",
    deliveryAddressLine3: wholesaleProfile?.deliveryAddressLine3 ?? "",
    deliveryTown:
      wholesaleProfile?.deliveryTown ?? defaultAddress?.city ?? "",
    deliveryPostcode:
      wholesaleProfile?.deliveryPostcode ?? defaultAddress?.postalCode ?? "",
    differentInvoiceAddress:
      wholesaleProfile?.differentInvoiceAddress ?? false,
    invoiceAddressLine1: wholesaleProfile?.invoiceAddressLine1 ?? "",
    invoiceAddressLine2: wholesaleProfile?.invoiceAddressLine2 ?? "",
    invoiceAddressLine3: wholesaleProfile?.invoiceAddressLine3 ?? "",
    invoiceTown: wholesaleProfile?.invoiceTown ?? "",
    invoicePostcode: wholesaleProfile?.invoicePostcode ?? "",
    companyType: wholesaleProfile?.companyType ?? "",
    companyNumber: wholesaleProfile?.companyNumber ?? "",
    directorName: wholesaleProfile?.directorName ?? "",
    businessType: wholesaleProfile?.businessType ?? "",
  };
}

export default async function WholesaleAccountSettingsPage() {
  const user = await requireWholesaleUser();
  const settings = await getAccountSettings(user.id);

  if (!settings) {
    notFound();
  }

  const wholesaleDefaults = buildWholesaleProfileDefaults(settings);

  return (
    <div className="page-shell py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            Wholesale settings
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900">
            Buyer, checkout, and company details
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Manage your primary buyer profile, saved checkout address, and wholesale registration details from one place.
          </p>
        </div>
        <AccountNav mode="wholesale" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-6">
          <WholesaleContactSettingsForm
            defaults={{
              firstName: wholesaleDefaults.firstName,
              lastName: wholesaleDefaults.lastName,
              email: settings.email,
              mobileNumber: wholesaleDefaults.mobileNumber,
              telephoneNumber: wholesaleDefaults.telephoneNumber,
              tradingName: wholesaleDefaults.tradingName,
            }}
          />
          <DefaultAddressSettingsForm
            defaults={settings.defaultAddress}
            mode="wholesale"
          />
        </div>

        <div className="space-y-6">
          <WholesaleBusinessSettingsForm defaults={wholesaleDefaults} />
          <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Heads up
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-slate-900">
              Saved settings support repeat ordering
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>
                Your contact details and default checkout address prefill future wholesale orders.
              </p>
              <p>
                Delivery and invoice details stay available for internal review and customer support follow-up.
              </p>
              <p>
                Reorders always use the current catalog, live stock, and your active wholesale pricing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
