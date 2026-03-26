"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateOrderStatusAction } from "@/lib/actions/admin-actions";
import { ORDER_STATUSES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export function AdminOrderStatusForm({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5">
      <p className="text-sm font-semibold text-slate-900">Update status</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Select value={status} onChange={(event) => setStatus(event.target.value)}>
          {ORDER_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Button
          type="button"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const result = await updateOrderStatusAction({ id: orderId, status });
              setMessage(result.success ? result.message ?? null : result.error);
              router.refresh();
            });
          }}
        >
          {isPending ? "Saving..." : "Save status"}
        </Button>
      </div>
      {message ? <p className="mt-3 text-sm text-slate-500">{message}</p> : null}
    </div>
  );
}
