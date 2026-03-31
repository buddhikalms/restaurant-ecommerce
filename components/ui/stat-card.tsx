import { formatCurrency } from "@/lib/utils";

export function StatCard({
  label,
  value,
  emphasizeCurrency = false
}: {
  label: string;
  value: number;
  emphasizeCurrency?: boolean;
}) {
  return (
    <div className="surface-card rounded-lg p-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">
        {emphasizeCurrency ? formatCurrency(value) : value.toLocaleString()}
      </p>
    </div>
  );
}
