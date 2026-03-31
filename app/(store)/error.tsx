"use client";

export default function StoreError({ reset }: { reset: () => void }) {
  return (
    <div className="page-shell py-10">
      <div className="surface-card rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Something went wrong</h2>
        <p className="mt-2 text-[0.82rem] text-[var(--muted-foreground)]">
          We hit an unexpected problem while loading this page.
        </p>
        <button
          onClick={reset}
          className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-[var(--brand)] px-3.5 text-[0.84rem] font-medium text-white transition hover:bg-[var(--brand-dark)]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
