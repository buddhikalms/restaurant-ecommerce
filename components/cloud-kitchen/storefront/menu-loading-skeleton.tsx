function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[var(--surface-muted)] ${className}`}
    />
  );
}

export function MenuLoadingSkeleton() {
  return (
    <div className="space-y-6 pb-10">
      <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <SkeletonBlock className="h-56 w-full sm:h-72" />
        <div className="-mt-10 rounded-[1.75rem] border border-[var(--border)] bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-3">
              <SkeletonBlock className="h-5 w-28" />
              <SkeletonBlock className="h-9 w-72" />
              <SkeletonBlock className="h-5 w-full" />
              <div className="flex flex-wrap gap-2">
                <SkeletonBlock className="h-9 w-20 rounded-full" />
                <SkeletonBlock className="h-9 w-20 rounded-full" />
                <SkeletonBlock className="h-9 w-20 rounded-full" />
              </div>
            </div>
            <SkeletonBlock className="h-11 w-full" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <SkeletonBlock className="h-32 w-full" />
          <SkeletonBlock className="h-16 w-full" />
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_14px_30px_rgba(15,23,42,0.04)]"
              >
                <SkeletonBlock className="h-44 w-full" />
                <div className="mt-4 space-y-3">
                  <SkeletonBlock className="h-5 w-32" />
                  <SkeletonBlock className="h-5 w-48" />
                  <SkeletonBlock className="h-4 w-full" />
                  <SkeletonBlock className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <SkeletonBlock className="hidden h-[32rem] w-full xl:block" />
      </div>
    </div>
  );
}
