import { Badge } from "@/components/ui/badge";
import { getOrderStatusTone, getStockLabel } from "@/lib/utils";

export function OrderStatusBadge({ status }: { status: string }) {
  return <Badge className={getOrderStatusTone(status)}>{status.replace("_", " ")}</Badge>;
}

export function StockBadge({ stockQuantity }: { stockQuantity: number }) {
  const label = getStockLabel(stockQuantity);
  const tone = stockQuantity <= 0 ? "bg-rose-100 text-rose-700" : stockQuantity <= 10 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700";
  return <Badge className={tone}>{label}</Badge>;
}
