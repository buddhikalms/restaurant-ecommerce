import Link from "next/link";

import { cn } from "@/lib/utils";

export function PaginationControls({
  currentPage,
  totalPages,
  buildHref,
}: {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        className="inline-flex h-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-[0.8rem] text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
      >
        Previous
      </Link>
      <div className="flex flex-wrap items-center gap-1.5">
        {pages.map((page) => (
          <Link
            key={page}
            href={buildHref(page)}
            className={cn(
              "inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-[0.78rem] transition",
              page === currentPage
                ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
            )}
          >
            {page}
          </Link>
        ))}
      </div>
      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        className="inline-flex h-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-[0.8rem] text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
      >
        Next
      </Link>
    </div>
  );
}
