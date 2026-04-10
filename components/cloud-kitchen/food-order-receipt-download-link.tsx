import { Download } from "lucide-react";

import { cn } from "@/lib/utils";

export function FoodOrderReceiptDownloadLink({
  orderId,
  className,
}: {
  orderId: string;
  className?: string;
}) {
  return (
    <a
      href={`/api/food-orders/${orderId}/receipt`}
      download
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 text-[0.84rem] font-medium text-white transition hover:bg-[var(--brand-dark)]",
        className,
      )}
    >
      <Download className="h-4 w-4 text-white" />
      <span className="text-white">Download receipt</span>
    </a>
  );
}
