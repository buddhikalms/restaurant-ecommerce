"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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

  return (
    <p
      className={
        notice.type === "success"
          ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          : "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
      }
    >
      {notice.text}
    </p>
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
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CustomerProfileFormValues>({
    resolver: zodResolver(customerProfileFormSchema),
    defaultValues: {
      name: defaults.name,
      email: defaults.email,
      phone: defaults.phone,
      businessName: defaults.businessName ?? ""
    }
  });

  return (
    <form
      className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
      onSubmit={handleSubmit((values) => {
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
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Account details</p>
        <h2 className="font-heading text-2xl font-semibold text-slate-900">Profile settings</h2>
        <p className="text-sm leading-6 text-slate-600">
          Keep your contact information current so order updates and checkout details stay accurate.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Full name</label>
          <Input {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
          <Input type="email" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Phone</label>
          <Input {...register("phone")} />
          <FieldError message={errors.phone?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Business name</label>
          <Input {...register("businessName")} />
          <FieldError message={errors.businessName?.message} />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <NoticeMessage notice={notice} />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving profile..." : "Save profile"}
        </Button>
      </div>
    </form>
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
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<DefaultAddressFormValues>({
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
    <form
      className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
      onSubmit={handleSubmit((values) => {
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
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {mode === "wholesale" ? "Checkout defaults" : "Shipping defaults"}
        </p>
        <h2 className="font-heading text-2xl font-semibold text-slate-900">
          {mode === "wholesale" ? "Default checkout address" : "Default shipping address"}
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          These fields prefill future checkout forms and help speed up repeat orders.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Address line 1</label>
          <Input {...register("line1")} />
          <FieldError message={errors.line1?.message} />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Address line 2</label>
          <Input {...register("line2")} />
          <FieldError message={errors.line2?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">City</label>
          <Input {...register("city")} />
          <FieldError message={errors.city?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">State</label>
          <Input {...register("state")} />
          <FieldError message={errors.state?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Postal code</label>
          <Input {...register("postalCode")} />
          <FieldError message={errors.postalCode?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Country</label>
          <Input {...register("country")} />
          <FieldError message={errors.country?.message} />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <NoticeMessage notice={notice} />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving address..." : "Save address"}
        </Button>
      </div>
    </form>
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
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<WholesaleContactFormValues>({
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
    <form
      className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
      onSubmit={handleSubmit((values) => {
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
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Buyer profile</p>
        <h2 className="font-heading text-2xl font-semibold text-slate-900">Wholesale contact details</h2>
        <p className="text-sm leading-6 text-slate-600">
          Update the primary buyer information your team uses for account communication and replenishment orders.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">First name</label>
          <Input {...register("firstName")} />
          <FieldError message={errors.firstName?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Last name</label>
          <Input {...register("lastName")} />
          <FieldError message={errors.lastName?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
          <Input type="email" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Trading name</label>
          <Input {...register("tradingName")} />
          <FieldError message={errors.tradingName?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Mobile number</label>
          <Input {...register("mobileNumber")} />
          <FieldError message={errors.mobileNumber?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Telephone number</label>
          <Input {...register("telephoneNumber")} />
          <FieldError message={errors.telephoneNumber?.message} />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <NoticeMessage notice={notice} />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving contact details..." : "Save contact details"}
        </Button>
      </div>
    </form>
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
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<WholesaleBusinessFormValues>({
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
  const showInvoiceAddress = Boolean(useWatch({ control, name: "differentInvoiceAddress" }));
  const selectedCompanyType = useWatch({ control, name: "companyType" });

  return (
    <form
      className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
      onSubmit={handleSubmit((values) => {
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
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Business details</p>
        <h2 className="font-heading text-2xl font-semibold text-slate-900">Company and invoicing profile</h2>
        <p className="text-sm leading-6 text-slate-600">
          Keep your delivery, invoicing, and company registration details in sync for wholesale approvals and admin follow-up.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        <section className="rounded-[1.7rem] border border-slate-200 bg-[rgba(255,250,242,0.72)] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">Delivery address</h3>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Address line 1</label>
              <Input {...register("deliveryAddressLine1")} />
              <FieldError message={errors.deliveryAddressLine1?.message} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Line 2</label>
              <Input {...register("deliveryAddressLine2")} />
              <FieldError message={errors.deliveryAddressLine2?.message} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Line 3</label>
              <Input {...register("deliveryAddressLine3")} />
              <FieldError message={errors.deliveryAddressLine3?.message} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Town</label>
              <Input {...register("deliveryTown")} />
              <FieldError message={errors.deliveryTown?.message} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Postcode</label>
              <Input {...register("deliveryPostcode")} />
              <FieldError message={errors.deliveryPostcode?.message} />
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <label className="flex items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
            <input type="checkbox" {...register("differentInvoiceAddress")} className="h-4 w-4 rounded border-slate-300" />
            <span>Different invoice address?</span>
          </label>

          {showInvoiceAddress ? (
            <div className="rounded-[1.7rem] border border-slate-200 bg-[rgba(255,250,242,0.72)] p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">Invoice address</h3>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Address line 1</label>
                  <Input {...register("invoiceAddressLine1")} />
                  <FieldError message={errors.invoiceAddressLine1?.message} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Line 2</label>
                  <Input {...register("invoiceAddressLine2")} />
                  <FieldError message={errors.invoiceAddressLine2?.message} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Line 3</label>
                  <Input {...register("invoiceAddressLine3")} />
                  <FieldError message={errors.invoiceAddressLine3?.message} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Town</label>
                  <Input {...register("invoiceTown")} />
                  <FieldError message={errors.invoiceTown?.message} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Postcode</label>
                  <Input {...register("invoicePostcode")} />
                  <FieldError message={errors.invoicePostcode?.message} />
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section className="space-y-5">
          <div>
            <label className="mb-3 block text-sm font-semibold text-slate-700">Company type</label>
            <div className="grid gap-3 md:grid-cols-2">
              {wholesaleCompanyTypes.map((companyType) => (
                <label
                  key={companyType}
                  className="flex items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                >
                  <input type="radio" value={companyType} {...register("companyType")} className="h-4 w-4 border-slate-300" />
                  <span>{companyType}</span>
                </label>
              ))}
            </div>
            <FieldError message={errors.companyType?.message} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Business type</label>
            <Select {...register("businessType")}>
              <option value="">Choose business type</option>
              {wholesaleBusinessTypes.map((businessType) => (
                <option key={businessType} value={businessType}>
                  {businessType}
                </option>
              ))}
            </Select>
            <FieldError message={errors.businessType?.message} />
          </div>

          <div className="rounded-[1.7rem] border border-slate-200 bg-[rgba(255,250,242,0.72)] p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">Limited company details</h3>
              <p className="text-xs text-slate-500">
                {selectedCompanyType === "Limited company"
                  ? "These fields are required for limited company accounts."
                  : "These fields remain optional unless you select Limited company."}
              </p>
            </div>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Company registration number</label>
                <Input {...register("companyNumber")} />
                <FieldError message={errors.companyNumber?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Director name</label>
                <Input {...register("directorName")} />
                <FieldError message={errors.directorName?.message} />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 space-y-4">
        <NoticeMessage notice={notice} />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving business profile..." : "Save business profile"}
        </Button>
      </div>
    </form>
  );
}

