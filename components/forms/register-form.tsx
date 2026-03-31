"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";

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

function CompactField({
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

function SectionBlock({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
        {description ? <p className="mt-1 text-[0.8rem] leading-5 text-[var(--muted-foreground)]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

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
    control,
    handleSubmit,
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
  const showInvoiceAddress = Boolean(useWatch({ control, name: "differentInvoiceAddress" }));
  const selectedCompanyType = useWatch({ control, name: "companyType" });

  return (
    <form
      className="space-y-4"
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
        <div className="space-y-4">
          <SectionBlock
            title="Your details"
            description="Add the main buyer contact details for your business account."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <CompactField label="First name" error={errors.firstName?.message}>
                <Input placeholder="First name" {...register("firstName")} />
              </CompactField>
              <CompactField label="Last name" error={errors.lastName?.message}>
                <Input placeholder="Last name" {...register("lastName")} />
              </CompactField>
              <CompactField label="Mobile number" error={errors.mobileNumber?.message}>
                <Input placeholder="Mobile number" {...register("mobileNumber")} />
              </CompactField>
              <CompactField label="Telephone number" error={errors.telephoneNumber?.message}>
                <Input placeholder="Telephone number" {...register("telephoneNumber")} />
              </CompactField>
              <CompactField label="Trading name" error={errors.tradingName?.message}>
                <Input placeholder="Trading name" {...register("tradingName")} />
              </CompactField>
              <CompactField label="Email" error={errors.email?.message}>
                <Input type="email" placeholder="buyer@restaurant.com" {...register("email")} />
              </CompactField>
            </div>
          </SectionBlock>

          <SectionBlock title="Delivery address" description="These details will be used during trade checkout.">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <CompactField label="Address line 1" error={errors.deliveryAddressLine1?.message}>
                  <Input placeholder="Address line 1" {...register("deliveryAddressLine1")} />
                </CompactField>
              </div>
              <CompactField label="Address line 2" error={errors.deliveryAddressLine2?.message}>
                <Input placeholder="Address line 2" {...register("deliveryAddressLine2")} />
              </CompactField>
              <CompactField label="Address line 3" error={errors.deliveryAddressLine3?.message}>
                <Input placeholder="Address line 3" {...register("deliveryAddressLine3")} />
              </CompactField>
              <CompactField label="Town" error={errors.deliveryTown?.message}>
                <Input placeholder="Town" {...register("deliveryTown")} />
              </CompactField>
              <CompactField label="Postcode" error={errors.deliveryPostcode?.message}>
                <Input placeholder="Postcode" {...register("deliveryPostcode")} />
              </CompactField>
            </div>
          </SectionBlock>

          <section className="space-y-3">
            <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[0.82rem] text-[var(--foreground)]">
              <input type="checkbox" {...register("differentInvoiceAddress")} className="h-4 w-4 rounded border-[var(--border-strong)]" />
              <span>Use a different invoice address</span>
            </label>

            {showInvoiceAddress ? (
              <SectionBlock title="Invoice address">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <CompactField label="Address line 1" error={errors.invoiceAddressLine1?.message}>
                      <Input placeholder="Address line 1" {...register("invoiceAddressLine1")} />
                    </CompactField>
                  </div>
                  <CompactField label="Address line 2" error={errors.invoiceAddressLine2?.message}>
                    <Input placeholder="Address line 2" {...register("invoiceAddressLine2")} />
                  </CompactField>
                  <CompactField label="Address line 3" error={errors.invoiceAddressLine3?.message}>
                    <Input placeholder="Address line 3" {...register("invoiceAddressLine3")} />
                  </CompactField>
                  <CompactField label="Town" error={errors.invoiceTown?.message}>
                    <Input placeholder="Town" {...register("invoiceTown")} />
                  </CompactField>
                  <CompactField label="Postcode" error={errors.invoicePostcode?.message}>
                    <Input placeholder="Postcode" {...register("invoicePostcode")} />
                  </CompactField>
                </div>
              </SectionBlock>
            ) : null}
          </section>

          <SectionBlock title="Business profile" description="Choose the company structure and business type that fits your account.">
            <div className="space-y-4">
              <div>
                <label className="field-label">Company type</label>
                <div className="grid gap-2 md:grid-cols-2">
                  {wholesaleCompanyTypes.map((companyType) => (
                    <label
                      key={companyType}
                      className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[0.82rem] text-[var(--foreground)]"
                    >
                      <input type="radio" value={companyType} {...register("companyType")} className="h-4 w-4 border-[var(--border-strong)]" />
                      <span>{companyType}</span>
                    </label>
                  ))}
                </div>
                <FieldError message={errors.companyType?.message} />
              </div>

              <CompactField label="Business type" error={errors.businessType?.message}>
                <Select {...register("businessType")}>
                  <option value="">Choose business type</option>
                  {wholesaleBusinessTypes.map((businessType) => (
                    <option key={businessType} value={businessType}>
                      {businessType}
                    </option>
                  ))}
                </Select>
              </CompactField>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                <h4 className="text-sm font-semibold text-[var(--foreground)]">Limited company details</h4>
                <p className="mt-1 text-[0.78rem] leading-5 text-[var(--muted-foreground)]">
                  {selectedCompanyType === "Limited company"
                    ? "These fields are required for limited company accounts."
                    : "These fields stay optional unless you choose Limited company."}
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <CompactField label="Company number" error={errors.companyNumber?.message}>
                    <Input placeholder="Company number" {...register("companyNumber")} />
                  </CompactField>
                  <CompactField label="Director name" error={errors.directorName?.message}>
                    <Input placeholder="Director name" {...register("directorName")} />
                  </CompactField>
                </div>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock title="Security">
            <div className="grid gap-4 md:grid-cols-2">
              <CompactField label="Password" error={errors.password?.message}>
                <Input type="password" placeholder="Minimum 8 characters" {...register("password")} />
              </CompactField>
              <CompactField label="Confirm password" error={errors.confirmPassword?.message}>
                <Input type="password" placeholder="Re-enter your password" {...register("confirmPassword")} />
              </CompactField>
            </div>
          </SectionBlock>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <CompactField label="Full name" error={errors.name?.message}>
            <Input placeholder="Elena Rivera" {...register("name")} />
          </CompactField>
          <CompactField label="Email" error={errors.email?.message}>
            <Input type="email" placeholder="buyer@restaurant.com" {...register("email")} />
          </CompactField>
          <CompactField label="Phone" error={errors.phone?.message}>
            <Input placeholder="+1 555 0102" {...register("phone")} />
          </CompactField>
          <CompactField label="Password" error={errors.password?.message}>
            <Input type="password" placeholder="Minimum 8 characters" {...register("password")} />
          </CompactField>
          <div className="md:col-span-2">
            <CompactField label="Confirm password" error={errors.confirmPassword?.message}>
              <Input type="password" placeholder="Re-enter your password" {...register("confirmPassword")} />
            </CompactField>
          </div>
        </div>
      )}

      {message ? <p className="notice-error">{message}</p> : null}

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
