"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { ActionResponse } from "@/lib/actions/action-response";

export function DeleteButton({
  label = "Delete",
  itemId,
  action,
  confirmMessage = "Are you sure you want to delete this item?"
}: {
  label?: string;
  itemId: string;
  action: (id: string) => Promise<ActionResponse>;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={isPending}
        onClick={() => {
          if (!window.confirm(confirmMessage)) {
            return;
          }

          startTransition(async () => {
            const result = await action(itemId);
            setMessage(result.success ? result.message ?? null : result.error);
            router.refresh();
          });
        }}
      >
        {isPending ? "Working..." : label}
      </Button>
      {message ? <p className="mt-2 text-xs text-slate-500">{message}</p> : null}
    </div>
  );
}
