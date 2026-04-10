export default function FoodMenuLoading() {
  return (
    <div className="space-y-6">
      <div className="h-[420px] animate-pulse rounded-[2rem] border border-[var(--border)] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.05)]" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="h-40 animate-pulse rounded-[1.6rem] border border-[var(--border)] bg-white" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[340px] animate-pulse rounded-[1.6rem] border border-[var(--border)] bg-white"
              />
            ))}
          </div>
        </div>
        <div className="hidden h-[520px] animate-pulse rounded-[1.8rem] border border-[var(--border)] bg-white xl:block" />
      </div>
    </div>
  );
}
