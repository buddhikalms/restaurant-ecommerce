import { Download } from "lucide-react";

import { cn } from "@/lib/utils";

export function OrderReceiptDownloadLink({
  orderId,
  className,
}: {
  orderId: string;
  className?: string;
}) {
  return (
    <a
      href={`/api/orders/${orderId}/receipt`}
      download
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-3.5 text-[0.84rem] font-medium text-white transition hover:bg-[var(--brand-dark)]",
        className,
      )}
    >
      <Download className="h-3.5 w-3.5 text-white" />
      <span className="text-white">Download receipt</span>
    </a>
  );
}
