import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type StatTrend = {
  direction: "up" | "down" | "flat";
  value: number;
  label: string;
};

export function StatCard({
  label,
  value,
  emphasizeCurrency = false,
  trend,
}: {
  label: string;
  value: number;
  emphasizeCurrency?: boolean;
  trend?: StatTrend;
}) {
  const TrendIcon =
    trend?.direction === "up"
      ? ArrowUpRight
      : trend?.direction === "down"
        ? ArrowDownRight
        : Minus;

  const trendClassName =
    trend?.direction === "up"
      ? "bg-[rgba(85,99,71,0.12)] text-[var(--accent-dark)]"
      : trend?.direction === "down"
        ? "bg-[rgba(179,86,72,0.12)] text-[var(--danger)]"
        : "bg-[var(--surface-muted)] text-[var(--muted-foreground)]";

  return (
    <Card className="rounded-xl border-[var(--border)] shadow-none">
      <CardContent className="space-y-2 p-4">
        <p className="text-[0.67rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
          {label}
        </p>
        <p className="text-[1.4rem] font-semibold tracking-[-0.03em] text-[var(--foreground)]">
          {emphasizeCurrency ? formatCurrency(value) : value.toLocaleString()}
        </p>
        {trend ? (
          <div
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[0.7rem] font-medium ${trendClassName}`}
          >
            <TrendIcon className="h-3.5 w-3.5" />
            <span>{trend.value}%</span>
            <span className="text-[var(--muted-foreground)]">{trend.label}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
