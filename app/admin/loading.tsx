export default function AdminLoading() {
  return (
    <div className="grid gap-6">
      <div className="surface-card h-40 animate-pulse rounded-[2rem] border border-white/70 bg-white/70" />
      <div className="grid gap-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface-card h-32 animate-pulse rounded-[2rem] border border-white/70 bg-white/70" />
        ))}
      </div>
    </div>
  );
}
