"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div className="surface-card rounded-[2rem] border border-white/70 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <h2 className="font-heading text-3xl font-semibold text-slate-900">
        Admin page failed to load
      </h2>
      <p className="mt-4 text-sm text-slate-600">
        Please try again. If the problem persists, check your environment
        variables and database connection.
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-dark)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
      >
        Try again
      </button>
    </div>
  );
}
