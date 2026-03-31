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
    <div className="page-shell py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Wholesale settings</p>
          <h1 className="section-title mt-2">Buyer and business details</h1>
          <p className="section-copy mt-2 max-w-2xl">
            Manage your primary buyer details, default address, and wholesale registration information.
          </p>
        </div>
        <AccountNav mode="wholesale" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-4">
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

        <div className="space-y-4">
          <WholesaleBusinessSettingsForm defaults={wholesaleDefaults} />
          <section className="paper-panel rounded-lg p-5">
            <p className="section-label">Repeat ordering</p>
            <h2 className="section-subtitle mt-2">Saved settings support trade checkout</h2>
            <div className="mt-3 space-y-2 text-[0.82rem] leading-6 text-[var(--muted-foreground)]">
              <p>Your contact details and default address prefill future wholesale orders.</p>
              <p>Delivery and invoice details remain available for internal review and support follow-up.</p>
              <p>Reorders always use the current catalog, live stock, and active pricing.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
