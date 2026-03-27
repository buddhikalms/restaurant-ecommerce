"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { registerCustomerAction, registerWholesaleCustomerAction } from "@/lib/actions/auth-actions";
import {
  customerRegisterSchema,
  wholesaleBusinessTypes,
  wholesaleCompanyTypes,
  wholesaleRegisterSchema,
} from "@/lib/validations/auth";

type RegisterValues = {
  name: string;
  businessName?: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  telephoneNumber?: string;
  tradingName?: string;
  deliveryAddressLine1?: string;
  deliveryAddressLine2?: string;
  deliveryAddressLine3?: string;
  deliveryTown?: string;
  deliveryPostcode?: string;
  differentInvoiceAddress?: boolean;
  invoiceAddressLine1?: string;
  invoiceAddressLine2?: string;
  invoiceAddressLine3?: string;
  invoiceTown?: string;
  invoicePostcode?: string;
  companyType?: string;
  companyNumber?: string;
  directorName?: string;
  businessType?: string;
};

export function RegisterForm({ mode = "customer" }: { mode?: "customer" | "wholesale" }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const schema = useMemo(
    () => (mode === "wholesale" ? wholesaleRegisterSchema : customerRegisterSchema),
    [mode]
  );
  const dashboardPath = mode === "wholesale" ? "/wholesale/account" : "/account";
  const action = mode === "wholesale" ? registerWholesaleCustomerAction : registerCustomerAction;
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      name: "",
      businessName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      mobileNumber: "",
      telephoneNumber: "",
      tradingName: "",
      deliveryAddressLine1: "",
      deliveryAddressLine2: "",
      deliveryAddressLine3: "",
      deliveryTown: "",
      deliveryPostcode: "",
      differentInvoiceAddress: false,
      invoiceAddressLine1: "",
      invoiceAddressLine2: "",
      invoiceAddressLine3: "",
      invoiceTown: "",
      invoicePostcode: "",
      companyType: "Limited company",
      companyNumber: "",
      directorName: "",
      businessType: ""
    }
  });
  const showInvoiceAddress = Boolean(watch("differentInvoiceAddress"));
  const selectedCompanyType = watch("companyType");

  return (
    <form
      className="space-y-8"
      onSubmit={handleSubmit((values) => {
        setMessage(null);
        startTransition(async () => {
          const result = await action(values);

          if (!result.success) {
            setMessage(result.error);
            return;
          }

          if (!result.data) {
            setMessage("Account created but sign-in details were not returned.");
            return;
          }

          await signIn("credentials", {
            email: result.data.email,
            password: result.data.password,
            redirect: false
          });

          router.push(dashboardPath);
          router.refresh();
        });
      })}
    >
      {mode === "wholesale" ? (
        <div className="space-y-8">
          <section className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Your details</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Please complete the wholesale registration form below with your contact, address, and company details.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">Details</h4>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">First name</label>
                  <Input placeholder="Name*" {...register("firstName")} />
                  <FieldError message={errors.firstName?.message} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Last name</label>
                  <Input placeholder="Last name*" {...register("lastName")} />
                  <FieldError message={errors.lastName?.message} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Mobile number</label>
                  <Input placeholder="Mobile Number*" {...register("mobileNumber")} />
                  <FieldError message={errors.mobileNumber?.message} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Telephone number</label>
                  <Input placeholder="Telephone number*" {...register("telephoneNumber")} />
                  <FieldError message={errors.telephoneNumber?.message} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Trading name</label>
                  <Input placeholder="Trading Name" {...register("tradingName")} />
                  <FieldError message={errors.tradingName?.message} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                  <Input type="email" placeholder="Email*" {...register("email")} />
                  <FieldError message={errors.email?.message} />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-5 rounded-[1.8rem] border border-slate-200 bg-[rgba(255,250,242,0.72)] p-5">
            <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">Delivery address</h4>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Address line 1</label>
                <Input placeholder="Delivery Address*" {...register("deliveryAddressLine1")} />
                <FieldError message={errors.deliveryAddressLine1?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Line 2</label>
                <Input placeholder="Line 2" {...register("deliveryAddressLine2")} />
                <FieldError message={errors.deliveryAddressLine2?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Line 3</label>
                <Input placeholder="Line 3" {...register("deliveryAddressLine3")} />
                <FieldError message={errors.deliveryAddressLine3?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Town</label>
                <Input placeholder="Delivery Address Town" {...register("deliveryTown")} />
                <FieldError message={errors.deliveryTown?.message} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Postcode</label>
                <Input placeholder="Delivery Address Postcode" {...register("deliveryPostcode")} />
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
              <div className="rounded-[1.8rem] border border-slate-200 bg-[rgba(255,250,242,0.72)] p-5">
                <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">Invoice address</h4>
                <div className="mt-4 grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Address line 1</label>
                    <Input placeholder="Invoice Address" {...register("invoiceAddressLine1")} />
                    <FieldError message={errors.invoiceAddressLine1?.message} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Line 2</label>
                    <Input placeholder="Line 2" {...register("invoiceAddressLine2")} />
                    <FieldError message={errors.invoiceAddressLine2?.message} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Line 3</label>
                    <Input placeholder="Line 3" {...register("invoiceAddressLine3")} />
                    <FieldError message={errors.invoiceAddressLine3?.message} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Town</label>
                    <Input placeholder="Invoice Address Town" {...register("invoiceTown")} />
                    <FieldError message={errors.invoiceTown?.message} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Postcode</label>
                    <Input placeholder="Invoice Address Postcode" {...register("invoicePostcode")} />
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

            <div className="rounded-[1.8rem] border border-slate-200 bg-[rgba(255,250,242,0.72)] p-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">Limited company details</h4>
                <p className="text-xs text-slate-500">
                  {selectedCompanyType === "Limited company"
                    ? "These details are required for limited company registrations."
                    : "These fields are optional unless you select Limited company."}
                </p>
              </div>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Company registration number</label>
                  <Input placeholder="Company Registration No" {...register("companyNumber")} />
                  <FieldError message={errors.companyNumber?.message} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Director name</label>
                  <Input placeholder="Director Name" {...register("directorName")} />
                  <FieldError message={errors.directorName?.message} />
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <Input type="password" placeholder="Minimum 8 characters" {...register("password")} />
              <FieldError message={errors.password?.message} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</label>
              <Input type="password" placeholder="Re-enter your password" {...register("confirmPassword")} />
              <FieldError message={errors.confirmPassword?.message} />
            </div>
          </section>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Full name</label>
            <Input placeholder="Elena Rivera" {...register("name")} />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
            <Input type="email" placeholder="buyer@restaurant.com" {...register("email")} />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Phone</label>
            <Input placeholder="+1 555 0102" {...register("phone")} />
            <FieldError message={errors.phone?.message} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
            <Input type="password" placeholder="Minimum 8 characters" {...register("password")} />
            <FieldError message={errors.password?.message} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</label>
            <Input type="password" placeholder="Re-enter your password" {...register("confirmPassword")} />
            <FieldError message={errors.confirmPassword?.message} />
          </div>
        </div>
      )}

      {message ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p> : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? mode === "wholesale"
            ? "Creating wholesale account..."
            : "Creating account..."
          : mode === "wholesale"
            ? "Create wholesale account"
            : "Create customer account"}
      </Button>
    </form>
  );
}
