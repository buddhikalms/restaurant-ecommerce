import { cn } from "@/lib/utils";

export function CategoryTabs({
  categories,
  activeCategoryId,
  onSelect,
}: {
  categories: Array<{ id: string; name: string; itemCount: number }>;
  activeCategoryId: string;
  onSelect: (categoryId: string) => void;
}) {
  return (
    <nav
      aria-label="Menu categories"
      className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white/92 p-2 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur"
    >
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={cn(
              "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[0.8rem] font-medium transition",
              activeCategoryId === category.id
                ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
            )}
          >
            <span>{category.name}</span>
            <span
              className={cn(
                "inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-[0.7rem]",
                activeCategoryId === category.id
                  ? "bg-white/20 text-white"
                  : "bg-[var(--surface-muted)] text-[var(--muted-foreground)]",
              )}
            >
              {category.itemCount}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
