"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import {
  updateCustomerProfileAction,
  updateDefaultAddressAction,
  updateWholesaleBusinessProfileAction,
  updateWholesaleContactAction
} from "@/lib/actions/account-actions";
import {
  customerAccountSettingsSchema,
  defaultAddressSettingsSchema,
  wholesaleBusinessSettingsSchema,
  wholesaleContactSettingsSchema
} from "@/lib/validations/account";
import { wholesaleBusinessTypes, wholesaleCompanyTypes } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Notice = {
  type: "success" | "error";
  text: string;
};

function NoticeMessage({ notice }: { notice: Notice | null }) {
  if (!notice) {
    return null;
  }

  return <p className={notice.type === "success" ? "notice-success" : "notice-error"}>{notice.text}</p>;
}

function SettingsPanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="surface-card rounded-lg p-5">
      <div className="flex flex-col gap-1">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
          {eyebrow}
        </p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
        <p className="text-[0.82rem] leading-5 text-[var(--muted-foreground)]">{description}</p>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

const customerProfileFormSchema = customerAccountSettingsSchema;
const defaultAddressFormSchema = defaultAddressSettingsSchema;
const wholesaleContactFormSchema = wholesaleContactSettingsSchema;
const wholesaleBusinessFormSchema = wholesaleBusinessSettingsSchema;

type CustomerProfileFormValues = z.infer<typeof customerProfileFormSchema>;
type DefaultAddressFormValues = z.infer<typeof defaultAddressFormSchema>;
type WholesaleContactFormValues = z.infer<typeof wholesaleContactFormSchema>;
type WholesaleBusinessFormValues = z.input<typeof wholesaleBusinessFormSchema>;

export function CustomerProfileSettingsForm({
  defaults
}: {
  defaults: {
    name: string;
    email: string;
    phone: string;
    businessName?: string | null;
  };
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<CustomerProfileFormValues>({
    resolver: zodResolver(customerProfileFormSchema),
    defaultValues: {
      name: defaults.name,
      email: defaults.email,
      phone: defaults.phone,
      businessName: defaults.businessName ?? ""
    }
  });

  return (
    <SettingsPanel
      eyebrow="Account details"
      title="Profile settings"
      description="Keep your primary contact details current for order updates and faster checkout."
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          setNotice(null);
          startTransition(async () => {
            const result = await updateCustomerProfileAction(values);

            if (!result.success) {
              setNotice({ type: "error", text: result.error });
              return;
            }

            setNotice({ type: "success", text: result.message ?? "Profile saved." });
            router.refresh();
          });
        })}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <Input type="email" {...form.register("email")} />
          </Field>
          <Field label="Phone" error={form.formState.errors.phone?.message}>
            <Input {...form.register("phone")} />
          </Field>
          <Field label="Business name" error={form.formState.errors.businessName?.message}>
            <Input {...form.register("businessName")} />
          </Field>
        </div>

        <NoticeMessage notice={notice} />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving profile..." : "Save profile"}
        </Button>
      </form>
    </SettingsPanel>
  );
}

export function DefaultAddressSettingsForm({
  defaults,
  mode = "customer"
}: {
  defaults?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  } | null;
  mode?: "customer" | "wholesale";
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<DefaultAddressFormValues>({
    resolver: zodResolver(defaultAddressFormSchema),
    defaultValues: {
      line1: defaults?.line1 ?? "",
      line2: defaults?.line2 ?? "",
      city: defaults?.city ?? "",
      state: defaults?.state ?? "",
      postalCode: defaults?.postalCode ?? "",
      country: defaults?.country ?? "USA"
    }
  });

  return (
    <SettingsPanel
      eyebrow={mode === "wholesale" ? "Checkout defaults" : "Shipping defaults"}
      title={mode === "wholesale" ? "Default checkout address" : "Default shipping address"}
      description="These values prefill future orders so repeat purchasing stays quick and consistent."
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          setNotice(null);
          startTransition(async () => {
            const result = await updateDefaultAddressAction(values);

            if (!result.success) {
              setNotice({ type: "error", text: result.error });
              return;
            }

            setNotice({ type: "success", text: result.message ?? "Address saved." });
            router.refresh();
          });
        })}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Address line 1" error={form.formState.errors.line1?.message}>
              <Input {...form.register("line1")} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Address line 2" error={form.formState.errors.line2?.message}>
              <Input {...form.register("line2")} />
            </Field>
          </div>
          <Field label="City" error={form.formState.errors.city?.message}>
            <Input {...form.register("city")} />
          </Field>
          <Field label="State" error={form.formState.errors.state?.message}>
            <Input {...form.register("state")} />
          </Field>
          <Field label="Postal code" error={form.formState.errors.postalCode?.message}>
            <Input {...form.register("postalCode")} />
          </Field>
          <Field label="Country" error={form.formState.errors.country?.message}>
            <Input {...form.register("country")} />
          </Field>
        </div>

        <NoticeMessage notice={notice} />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving address..." : "Save address"}
        </Button>
      </form>
    </SettingsPanel>
  );
}

export function WholesaleContactSettingsForm({
  defaults
}: {
  defaults: {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    telephoneNumber: string;
    tradingName?: string | null;
  };
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<WholesaleContactFormValues>({
    resolver: zodResolver(wholesaleContactFormSchema),
    defaultValues: {
      firstName: defaults.firstName,
      lastName: defaults.lastName,
      email: defaults.email,
      mobileNumber: defaults.mobileNumber,
      telephoneNumber: defaults.telephoneNumber,
      tradingName: defaults.tradingName ?? ""
    }
  });

  return (
    <SettingsPanel
      eyebrow="Buyer profile"
      title="Wholesale contact details"
      description="Update the main buyer details used for account communication and replenishment orders."
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          setNotice(null);
          startTransition(async () => {
            const result = await updateWholesaleContactAction(values);

            if (!result.success) {
              setNotice({ type: "error", text: result.error });
              return;
            }

            setNotice({ type: "success", text: result.message ?? "Wholesale contact details saved." });
            router.refresh();
          });
        })}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="First name" error={form.formState.errors.firstName?.message}>
            <Input {...form.register("firstName")} />
          </Field>
          <Field label="Last name" error={form.formState.errors.lastName?.message}>
            <Input {...form.register("lastName")} />
          </Field>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <Input type="email" {...form.register("email")} />
          </Field>
          <Field label="Trading name" error={form.formState.errors.tradingName?.message}>
            <Input {...form.register("tradingName")} />
          </Field>
          <Field label="Mobile number" error={form.formState.errors.mobileNumber?.message}>
            <Input {...form.register("mobileNumber")} />
          </Field>
          <Field label="Telephone number" error={form.formState.errors.telephoneNumber?.message}>
            <Input {...form.register("telephoneNumber")} />
          </Field>
        </div>

        <NoticeMessage notice={notice} />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving contact details..." : "Save contact details"}
        </Button>
      </form>
    </SettingsPanel>
  );
}

export function WholesaleBusinessSettingsForm({
  defaults
}: {
  defaults: {
    deliveryAddressLine1: string;
    deliveryAddressLine2?: string | null;
    deliveryAddressLine3?: string | null;
    deliveryTown: string;
    deliveryPostcode: string;
    differentInvoiceAddress: boolean;
    invoiceAddressLine1?: string | null;
    invoiceAddressLine2?: string | null;
    invoiceAddressLine3?: string | null;
    invoiceTown?: string | null;
    invoicePostcode?: string | null;
    companyType: string;
    companyNumber?: string | null;
    directorName?: string | null;
    businessType: string;
  };
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<WholesaleBusinessFormValues>({
    resolver: zodResolver(wholesaleBusinessFormSchema),
    defaultValues: {
      deliveryAddressLine1: defaults.deliveryAddressLine1,
      deliveryAddressLine2: defaults.deliveryAddressLine2 ?? "",
      deliveryAddressLine3: defaults.deliveryAddressLine3 ?? "",
      deliveryTown: defaults.deliveryTown,
      deliveryPostcode: defaults.deliveryPostcode,
      differentInvoiceAddress: defaults.differentInvoiceAddress,
      invoiceAddressLine1: defaults.invoiceAddressLine1 ?? "",
      invoiceAddressLine2: defaults.invoiceAddressLine2 ?? "",
      invoiceAddressLine3: defaults.invoiceAddressLine3 ?? "",
      invoiceTown: defaults.invoiceTown ?? "",
      invoicePostcode: defaults.invoicePostcode ?? "",
      companyType: defaults.companyType,
      companyNumber: defaults.companyNumber ?? "",
      directorName: defaults.directorName ?? "",
      businessType: defaults.businessType
    }
  });
  const showInvoiceAddress = Boolean(useWatch({ control: form.control, name: "differentInvoiceAddress" }));
  const selectedCompanyType = useWatch({ control: form.control, name: "companyType" });

  return (
    <SettingsPanel
      eyebrow="Business details"
      title="Company and invoicing profile"
      description="Keep your delivery, invoicing, and business registration details aligned with your wholesale account."
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          setNotice(null);
          startTransition(async () => {
            const result = await updateWholesaleBusinessProfileAction(values);

            if (!result.success) {
              setNotice({ type: "error", text: result.error });
              return;
            }

            setNotice({ type: "success", text: result.message ?? "Wholesale business profile saved." });
            router.refresh();
          });
        })}
      >
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Delivery address</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field label="Address line 1" error={form.formState.errors.deliveryAddressLine1?.message}>
                <Input {...form.register("deliveryAddressLine1")} />
              </Field>
            </div>
            <Field label="Address line 2" error={form.formState.errors.deliveryAddressLine2?.message}>
              <Input {...form.register("deliveryAddressLine2")} />
            </Field>
            <Field label="Address line 3" error={form.formState.errors.deliveryAddressLine3?.message}>
              <Input {...form.register("deliveryAddressLine3")} />
            </Field>
            <Field label="Town" error={form.formState.errors.deliveryTown?.message}>
              <Input {...form.register("deliveryTown")} />
            </Field>
            <Field label="Postcode" error={form.formState.errors.deliveryPostcode?.message}>
              <Input {...form.register("deliveryPostcode")} />
            </Field>
          </div>
        </section>

        <section className="space-y-3">
          <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[0.82rem] text-[var(--foreground)]">
            <input type="checkbox" {...form.register("differentInvoiceAddress")} className="h-4 w-4 rounded border-[var(--border-strong)]" />
            <span>Use a different invoice address</span>
          </label>

          {showInvoiceAddress ? (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Invoice address</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field label="Address line 1" error={form.formState.errors.invoiceAddressLine1?.message}>
                    <Input {...form.register("invoiceAddressLine1")} />
                  </Field>
                </div>
                <Field label="Address line 2" error={form.formState.errors.invoiceAddressLine2?.message}>
                  <Input {...form.register("invoiceAddressLine2")} />
                </Field>
                <Field label="Address line 3" error={form.formState.errors.invoiceAddressLine3?.message}>
                  <Input {...form.register("invoiceAddressLine3")} />
                </Field>
                <Field label="Town" error={form.formState.errors.invoiceTown?.message}>
                  <Input {...form.register("invoiceTown")} />
                </Field>
                <Field label="Postcode" error={form.formState.errors.invoicePostcode?.message}>
                  <Input {...form.register("invoicePostcode")} />
                </Field>
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <div>
            <label className="field-label">Company type</label>
            <div className="grid gap-2 md:grid-cols-2">
              {wholesaleCompanyTypes.map((companyType) => (
                <label
                  key={companyType}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[0.82rem] text-[var(--foreground)]"
                >
                  <input type="radio" value={companyType} {...form.register("companyType")} className="h-4 w-4 border-[var(--border-strong)]" />
                  <span>{companyType}</span>
                </label>
              ))}
            </div>
            <FieldError message={form.formState.errors.companyType?.message} />
          </div>

          <div className="mt-4">
            <Field label="Business type" error={form.formState.errors.businessType?.message}>
              <Select {...form.register("businessType")}>
                <option value="">Choose business type</option>
                {wholesaleBusinessTypes.map((businessType) => (
                  <option key={businessType} value={businessType}>
                    {businessType}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Limited company details</h3>
            <p className="mt-1 text-[0.78rem] leading-5 text-[var(--muted-foreground)]">
              {selectedCompanyType === "Limited company"
                ? "These fields are required for limited company accounts."
                : "These fields stay optional unless you choose Limited company."}
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Company number" error={form.formState.errors.companyNumber?.message}>
                <Input {...form.register("companyNumber")} />
              </Field>
              <Field label="Director name" error={form.formState.errors.directorName?.message}>
                <Input {...form.register("directorName")} />
              </Field>
            </div>
          </div>
        </section>

        <NoticeMessage notice={notice} />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving business profile..." : "Save business profile"}
        </Button>
      </form>
    </SettingsPanel>
  );
}
