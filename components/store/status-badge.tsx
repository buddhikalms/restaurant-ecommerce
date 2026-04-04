import { Badge } from "@/components/ui/badge";
import { formatEnumLabel, getOrderStatusTone, getStockLabel } from "@/lib/utils";

export function OrderStatusBadge({ status }: { status: string }) {
  return <Badge className={getOrderStatusTone(status)}>{formatEnumLabel(status)}</Badge>;
}

export function StockBadge({ stockQuantity }: { stockQuantity: number }) {
  const label = getStockLabel(stockQuantity);
  const tone =
    stockQuantity <= 0
      ? "bg-[rgba(179,86,72,0.12)] text-[var(--danger)]"
      : stockQuantity <= 10
        ? "bg-[rgba(184,107,87,0.12)] text-[var(--brand-dark)]"
        : "bg-[rgba(85,99,71,0.12)] text-[var(--accent-dark)]";

  return <Badge className={tone}>{label}</Badge>;
}
