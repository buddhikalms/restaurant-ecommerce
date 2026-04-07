"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { useFoodCart } from "@/components/providers/food-cart-provider";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { placeFoodOrderAction } from "@/lib/actions/cloud-kitchen-actions";
import { CLOUD_KITCHEN_SERVICE_DEFAULTS } from "@/lib/cloud-kitchen/defaults";
import { formatCurrency, formatDistanceKm } from "@/lib/utils";

type DeliveryAddressOption = {
  id?: string;
  label: string | null;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  formattedAddress: string;
  placeId: string | null;
  latitude: number;
  longitude: number;
  deliveryInstructions: string | null;
};

type DeliveryPreview = {
  fulfillmentType: "DELIVERY" | "PICKUP";
  kitchenId: string;
  kitchenName: string;
  deliveryZoneName: string | null;
  distanceKm: number | null;
  deliveryFee: number;
  minimumOrderAmount: number;
  freeDeliveryMinimum: number | null;
};

type CheckoutFormValues = {
  recipientName: string;
  phone: string;
  label: string;
  deliveryInstructions: string;
  notes: string;
  saveAddressForLater: boolean;
};

export function FoodCheckoutForm({
  kitchenId,
  kitchenName,
  preview,
  address,
}: {
  kitchenId: string;
  kitchenName: string;
  preview: DeliveryPreview;
  address: DeliveryAddressOption;
}) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useFoodCart();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isPickup = preview.fulfillmentType === "PICKUP";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    defaultValues: {
      recipientName: address.recipientName,
      phone: address.phone,
      label: address.label ?? (isPickup ? "Pickup" : "Home"),
      deliveryInstructions: address.deliveryInstructions ?? "",
      notes: "",
      saveAddressForLater: !isPickup,
    },
  });

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <form
        className="surface-card rounded-2xl p-5"
        onSubmit={handleSubmit((values) => {
          if (!items.length) {
            setMessage("Your food cart is empty.");
            return;
          }

          setMessage(null);
          startTransition(async () => {
            const result = await placeFoodOrderAction({
              kitchenId,
              fulfillmentType: preview.fulfillmentType,
              items: items.map((item) => ({
                foodItemId: item.foodItemId,
                quantity: item.quantity,
              })),
              notes: values.notes,
              saveAddressForLater: isPickup ? false : values.saveAddressForLater,
              deliveryAddress: {
                label: isPickup ? "Pickup" : values.label,
                recipientName: values.recipientName,
                phone: values.phone,
                line1: address.line1,
                line2: address.line2 ?? "",
                city: address.city,
                state: address.state,
                postalCode: address.postalCode,
                country: address.country,
                formattedAddress: address.formattedAddress,
                placeId: address.placeId ?? "",
                latitude: address.latitude,
                longitude: address.longitude,
                deliveryInstructions: values.deliveryInstructions,
                isDefault: false,
              },
            });

            if (!result.success) {
              setMessage(result.error);
              return;
            }

            clearCart();
            router.push(`/account/food-orders/${result.data?.orderId}?placed=1`);
            router.refresh();
          });
        })}
      >
        <div className="space-y-4">
          <div>
            <p className="section-label">Checkout</p>
            <h2 className="section-subtitle mt-2">
              {isPickup ? "Confirm your pickup details" : "Confirm your delivery details"}
            </h2>
            <p className="section-copy mt-2">
              {isPickup
                ? `Your order will be prepared by ${kitchenName} for collection from the kitchen.`
                : `Your order will be prepared by ${kitchenName} once the server confirms the mapped address and delivery rules. Expected delivery is ${CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryTimeMinMins} to ${CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryTimeMaxMins} minutes for nearby orders.`}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-[0.82rem] text-[var(--muted-foreground)]">
            <p className="font-medium text-[var(--foreground)]">{isPickup ? "Pickup location" : "Mapped delivery address"}</p>
            <p className="mt-2">{address.formattedAddress}</p>
            {!isPickup ? (
              <p className="mt-2 text-[0.74rem]">
                Coordinates: {address.latitude.toFixed(6)}, {address.longitude.toFixed(6)}
              </p>
            ) : null}
            <p className="mt-2 text-[0.74rem]">
              {isPickup
                ? "We will prepare your order for collection at this kitchen."
                : "Need a different address? Go back to the location step and validate it first."}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="field-label">Recipient name</label>
              <Input {...register("recipientName", { required: true })} />
              <FieldError message={errors.recipientName?.message} />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <Input {...register("phone", { required: true })} />
              <FieldError message={errors.phone?.message} />
            </div>
          </div>

          {!isPickup ? (
            <div>
              <label className="field-label">Address label</label>
              <Input {...register("label")} />
            </div>
          ) : null}

          <div>
            <label className="field-label">{isPickup ? "Pickup instructions" : "Delivery instructions"}</label>
            <Textarea {...register("deliveryInstructions")} />
          </div>

          <div>
            <label className="field-label">Order notes</label>
            <Textarea {...register("notes")} placeholder="Optional kitchen notes" />
          </div>

          {!isPickup ? (
            <label className="flex items-center gap-3 text-[0.8rem] font-medium text-[var(--foreground)]">
              <input type="checkbox" {...register("saveAddressForLater")} className="h-4 w-4 rounded border-[var(--border)]" />
              Save this delivery address to my account
            </label>
          ) : null}

          {message ? (
            <p className="rounded-xl bg-[var(--surface-muted)] px-4 py-3 text-[0.8rem] text-[var(--danger)]">
              {message}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isPending || !items.length}>
            {isPending ? "Placing order..." : isPickup ? "Place pickup order" : "Place food order"}
          </Button>
        </div>
      </form>

      <aside className="surface-card rounded-2xl p-4">
        <p className="section-label">Order summary</p>
        <div className="mt-3 space-y-2 text-[0.82rem] text-[var(--muted-foreground)]">
          {items.map((item) => (
            <div key={item.itemId} className="flex items-center justify-between gap-2">
              <span className="line-clamp-1">{item.name} x {item.quantity}</span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4 text-[0.82rem] text-[var(--muted-foreground)]">
          <div className="flex items-center justify-between">
            <span>Kitchen</span>
            <span>{kitchenName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Method</span>
            <span>{isPickup ? "Pickup" : "Delivery"}</span>
          </div>
          {!isPickup ? (
            <>
              <div className="flex items-center justify-between">
                <span>Delivery zone</span>
                <span>{preview.deliveryZoneName ?? "Kitchen radius"}</span>
              </div>
              {preview.distanceKm !== null ? (
                <div className="flex items-center justify-between">
                  <span>Distance</span>
                  <span>{formatDistanceKm(preview.distanceKm)}</span>
                </div>
              ) : null}
            </>
          ) : null}
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{isPickup ? "Pickup fee" : "Delivery fee"}</span>
            <span>{formatCurrency(preview.deliveryFee)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-[var(--border)] pt-2 text-sm font-semibold text-[var(--foreground)]">
            <span>Total</span>
            <span>{formatCurrency(subtotal + preview.deliveryFee)}</span>
          </div>
          <p className="pt-2 text-[0.72rem] leading-5">
            {isPickup
              ? `Pickup orders are prepared by ${kitchenName} and usually ready in ${CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryTimeMinMins} to ${CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryTimeMaxMins} minutes.`
              : `Minimum order for this area: ${formatCurrency(preview.minimumOrderAmount)}. Typical delivery time is ${CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryTimeMinMins} to ${CLOUD_KITCHEN_SERVICE_DEFAULTS.deliveryTimeMaxMins} minutes.`}
          </p>
          {!isPickup && preview.freeDeliveryMinimum !== null ? (
            <p className="text-[0.72rem] leading-5">
              Free delivery above {formatCurrency(preview.freeDeliveryMinimum)}.
            </p>
          ) : null}
        </div>
      </aside>
    </div>
  );
}