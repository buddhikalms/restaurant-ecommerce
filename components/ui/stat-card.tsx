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
    <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-4 font-heading text-3xl font-semibold text-slate-900">
        {emphasizeCurrency ? formatCurrency(value) : value.toLocaleString()}
      </p>
    </div>
  );
}
