export default function StoreLoading() {
  return (
    <div className="page-shell py-16">
      <div className="surface-card h-56 animate-pulse rounded-[2rem] border border-white/70 bg-white/70" />
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="surface-card h-80 animate-pulse rounded-[2rem] border border-white/70 bg-white/70" />
        ))}
      </div>
    </div>
  );
}
