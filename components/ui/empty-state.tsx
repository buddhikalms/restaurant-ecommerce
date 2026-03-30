import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="surface-card rounded-[2rem] border border-white/70 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <h3 className="font-heading text-2xl font-semibold text-slate-900">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-dark)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
