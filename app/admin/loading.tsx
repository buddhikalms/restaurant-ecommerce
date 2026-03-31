export default function AdminLoading() {
  return (
    <div className="grid gap-4">
      <div className="h-24 animate-pulse rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)]" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)]"
          />
        ))}
      </div>
      <div className="h-[320px] animate-pulse rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)]" />
    </div>
  );
}
