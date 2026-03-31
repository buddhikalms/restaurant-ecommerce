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
    <div className="surface-card rounded-lg p-8 text-center">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-[var(--brand)] px-3.5 text-[0.84rem] font-medium text-white transition hover:bg-[var(--brand-dark)]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
