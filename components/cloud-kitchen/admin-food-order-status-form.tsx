"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateFoodOrderStatusAction } from "@/lib/actions/cloud-kitchen-actions";
import { FOOD_ORDER_STATUSES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export function AdminFoodOrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(null);
        startTransition(async () => {
          const result = await updateFoodOrderStatusAction({
            id: orderId,
            status,
          });
          setMessage(result.success ? result.message ?? null : result.error);
          router.refresh();
        });
      }}
    >
      <Select value={status} onChange={(event) => setStatus(event.target.value)}>
        {FOOD_ORDER_STATUSES.map((entry) => (
          <option key={entry} value={entry}>
            {entry.replaceAll("_", " ")}
          </option>
        ))}
      </Select>
      {message ? (
        <p className="text-[0.76rem] text-[var(--admin-muted-foreground)]">{message}</p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Updating..." : "Update status"}
      </Button>
    </form>
  );
}

