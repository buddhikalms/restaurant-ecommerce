"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { placeOrderAction } from "@/lib/actions/order-actions";
import { type PricingMode } from "@/lib/user-roles";
import { formatCurrency } from "@/lib/utils";
import {
  checkoutSchema,
  wholesaleCheckoutSchema,
} from "@/lib/validations/checkout";

const retailCheckoutFormSchema = checkoutSchema.omit({ items: true });
const wholesaleCheckoutFormSchema = wholesaleCheckoutSchema.omit({ items: true });

type CheckoutFormValues = z.infer<typeof retailCheckoutFormSchema>;

export function CheckoutForm({
  customerDefaults,
  pricingMode,
  accountBasePath,
}: {
  customerDefaults: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    businessName?: string | null;
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  };
  pricingMode: PricingMode;
  accountBasePath: string;
}) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formSchema =
    pricingMode === "wholesale"
      ? wholesaleCheckoutFormSchema
      : retailCheckoutFormSchema;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: customerDefaults.name ?? "",
      businessName: customerDefaults.businessName ?? "",
      email: customerDefaults.email ?? "",
      phone: customerDefaults.phone ?? "",
      line1: customerDefaults.line1 ?? "",
      line2: customerDefaults.line2 ?? "",
      city: customerDefaults.city ?? "",
      state: customerDefaults.state ?? "",
      postalCode: customerDefaults.postalCode ?? "",
      country: customerDefaults.country ?? "USA",
      notes: "",
    },
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form
        className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
        onSubmit={handleSubmit((values) => {
          if (!items.length) {
            setMessage("Your cart is empty.");
            return;
          }

          setMessage(null);
          startTransition(async () => {
            const result = await placeOrderAction({
              ...values,
              items: items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
              })),
            });

            if (!result.success) {
              setMessage(result.error);
              return;
            }

            if (!result.data) {
              setMessage("Order placed but no order reference was returned.");
              return;
            }

            clearCart();
            router.push(`${accountBasePath}/orders/${result.data.orderId}?placed=1`);
            router.refresh();
          });
        })}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Customer name
            </label>
            <Input {...register("customerName")} />
            <FieldError message={errors.customerName?.message} />
          </div>
          {pricingMode === "wholesale" ? (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Business name
              </label>
              <Input {...register("businessName")} />
              <FieldError message={errors.businessName?.message} />
            </div>
          ) : null}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>
            <Input type="email" {...register("email")} />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Phone
            </label>
            <Input {...register("phone")} />
            <FieldError message={errors.phone?.message} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Address line 1
            </label>
            <Input {...register("line1")} />
            <FieldError message={errors.line1?.message} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Address line 2
            </label>
            <Input {...register("line2")} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              City
            </label>
            <Input {...register("city")} />
            <FieldError message={errors.city?.message} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              State
            </label>
            <Input {...register("state")} />
            <FieldError message={errors.state?.message} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Postal code
            </label>
            <Input {...register("postalCode")} />
            <FieldError message={errors.postalCode?.message} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Country
            </label>
            <Input {...register("country")} />
            <FieldError message={errors.country?.message} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Order notes
            </label>
            <Textarea
              {...register("notes")}
              placeholder="Delivery window, receiving instructions, or kitchen notes"
            />
            <FieldError message={errors.notes?.message} />
          </div>
        </div>

        {message ? (
          <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
          </p>
        ) : null}

        <Button type="submit" className="mt-6 w-full" disabled={isPending || !items.length}>
          {isPending
            ? pricingMode === "wholesale"
              ? "Submitting wholesale order..."
              : "Submitting order..."
            : pricingMode === "wholesale"
              ? "Submit wholesale order"
              : "Submit order"}
        </Button>
      </form>

      <aside className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {pricingMode === "wholesale" ? "Wholesale order summary" : "Order summary"}
        </p>
        <div className="mt-6 space-y-4 text-sm text-slate-600">
          {items.map((item) => (
            <div key={item.itemId} className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900">{item.name}</p>
                {item.variantName ? (
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    {item.variantName}
                  </p>
                ) : null}
                <p>{item.quantity} units</p>
              </div>
              <p className="font-semibold text-slate-900">
                {formatCurrency(item.quantity * item.unitPrice)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
            <span>Shipping</span>
            <span className="font-semibold text-slate-900">Quoted after review</span>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            {pricingMode === "wholesale"
              ? "Before final confirmation, inventory, VAT-inclusive totals, and wholesale minimum quantities are revalidated on the server for each selected product option."
              : "Before final confirmation, inventory and VAT-inclusive totals are revalidated on the server for each selected product option."}
          </p>
        </div>
      </aside>
    </div>
  );
}
