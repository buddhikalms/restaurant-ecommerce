"use client";

import { Search } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type StoreSearchFormProps = {
  className?: string;
  compact?: boolean;
  placeholder?: string;
};

const PRESERVED_FILTER_KEYS = ["category", "minPrice", "maxPrice"];

export function StoreSearchForm({
  className,
  compact = false,
  placeholder = "Search products or SKU",
}: StoreSearchFormProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const syncedQuery = pathname === "/products" ? searchParams.get("q") ?? "" : "";
  const [query, setQuery] = useState(syncedQuery);

  useEffect(() => {
    setQuery(syncedQuery);
  }, [syncedQuery]);

  const preservedFilters = useMemo(() => {
    if (pathname !== "/products") {
      return [];
    }

    return PRESERVED_FILTER_KEYS.map((key) => ({
      key,
      value: searchParams.get(key) ?? "",
    })).filter((entry) => entry.value);
  }, [pathname, searchParams]);

  return (
    <form
      action="/products"
      className={cn(
        "flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3",
        compact ? "h-9" : "h-10",
        className,
      )}
    >
      {preservedFilters.map((entry) => (
        <input key={entry.key} type="hidden" name={entry.key} value={entry.value} />
      ))}
      <Search className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
      <input
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent text-[0.82rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
      />
      <button
        type="submit"
        className={cn(
          "rounded-md bg-[var(--brand)] px-2.5 text-[0.76rem] font-medium text-white transition hover:bg-[var(--brand-dark)]",
          compact ? "h-7" : "h-8",
        )}
      >
        Search
      </button>
    </form>
  );
}
