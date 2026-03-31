"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateOrderStatusAction } from "@/lib/actions/admin-actions";
import { ORDER_STATUSES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

export function AdminOrderStatusForm({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-none">
      <CardHeader className="border-b border-[var(--admin-border)] px-4 py-3">
        <p className="admin-kicker">Workflow</p>
        <CardTitle className="mt-1 text-sm">Update status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
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
        {message ? (
          <p className="text-[0.76rem] text-[var(--admin-muted-foreground)]">{message}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
