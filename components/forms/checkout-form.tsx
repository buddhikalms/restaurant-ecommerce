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
  const formSchema = pricingMode === "wholesale" ? wholesaleCheckoutFormSchema : retailCheckoutFormSchema;
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
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <form
        className="surface-card rounded-lg p-5"
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
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="field-label">Customer name</label>
            <Input {...register("customerName")} />
            <FieldError message={errors.customerName?.message} />
          </div>
          {pricingMode === "wholesale" ? (
            <div>
              <label className="field-label">Business name</label>
              <Input {...register("businessName")} />
              <FieldError message={errors.businessName?.message} />
            </div>
          ) : null}
          <div>
            <label className="field-label">Email</label>
            <Input type="email" {...register("email")} />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <label className="field-label">Phone</label>
            <Input {...register("phone")} />
            <FieldError message={errors.phone?.message} />
          </div>
          <div className="md:col-span-2">
            <label className="field-label">Address line 1</label>
            <Input {...register("line1")} />
            <FieldError message={errors.line1?.message} />
          </div>
          <div className="md:col-span-2">
            <label className="field-label">Address line 2</label>
            <Input {...register("line2")} />
          </div>
          <div>
            <label className="field-label">City</label>
            <Input {...register("city")} />
            <FieldError message={errors.city?.message} />
          </div>
          <div>
            <label className="field-label">State</label>
            <Input {...register("state")} />
            <FieldError message={errors.state?.message} />
          </div>
          <div>
            <label className="field-label">Postal code</label>
            <Input {...register("postalCode")} />
            <FieldError message={errors.postalCode?.message} />
          </div>
          <div>
            <label className="field-label">Country</label>
            <Input {...register("country")} />
            <FieldError message={errors.country?.message} />
          </div>
          <div className="md:col-span-2">
            <label className="field-label">Notes</label>
            <Textarea {...register("notes")} placeholder="Optional delivery notes" />
            <FieldError message={errors.notes?.message} />
          </div>
        </div>

        {message ? <p className="mt-4 rounded-md bg-[var(--surface-muted)] px-3 py-2 text-[0.82rem] text-[var(--danger)]">{message}</p> : null}

        <Button type="submit" className="mt-4 w-full" disabled={isPending || !items.length}>
          {isPending ? "Submitting..." : pricingMode === "wholesale" ? "Submit wholesale order" : "Submit order"}
        </Button>
      </form>

      <aside className="surface-card rounded-lg p-4">
        <p className="section-label">Order summary</p>
        <div className="mt-3 space-y-2 text-[0.82rem] text-[var(--muted-foreground)]">
          {items.map((item) => (
            <div key={item.itemId} className="flex items-center justify-between gap-2">
              <span className="line-clamp-1">{item.name}</span>
              <span>{formatCurrency(item.quantity * item.unitPrice)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <div className="flex items-center justify-between text-sm text-[var(--foreground)]">
            <span>Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <p className="mt-2 text-[0.72rem] leading-5 text-[var(--muted-foreground)]">
            Shipping is quoted after review.
          </p>
        </div>
      </aside>
    </div>
  );
}
