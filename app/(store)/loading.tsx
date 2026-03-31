export default function StoreLoading() {
  return (
    <div className="page-shell py-8">
      <div className="surface-card h-40 animate-pulse rounded-lg bg-[var(--surface)]" />
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="surface-card h-56 animate-pulse rounded-lg bg-[var(--surface)]" />
        ))}
      </div>
    </div>
  );
}
