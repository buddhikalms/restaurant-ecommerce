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
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        Previous
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        {pages.map((page) => (
          <Link
            key={page}
            href={buildHref(page)}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition",
              page === currentPage
                ? "border-[var(--brand)] bg-[var(--brand-dark)] text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            {page}
          </Link>
        ))}
      </div>
      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        Next
      </Link>
    </div>
  );
}
