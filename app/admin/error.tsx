"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[360px] items-center justify-center">
      <div className="max-w-md rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-8 text-center shadow-none">
        <h2 className="text-xl font-semibold text-[var(--admin-foreground)]">
          Admin page failed to load
        </h2>
        <p className="mt-3 text-[0.84rem] leading-6 text-[var(--admin-muted-foreground)]">
          Try again. If the issue keeps happening, check the environment variables and database connection for this admin workspace.
        </p>
        <button
          onClick={reset}
          className="mt-5 inline-flex h-9 items-center justify-center rounded-lg bg-[var(--brand)] px-3.5 text-[0.82rem] font-medium text-white transition hover:bg-[var(--brand-dark)]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
