"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function ProductFilters({
  categories,
  initialQuery,
  initialCategory,
  initialMinPrice,
  initialMaxPrice
}: {
  categories: Array<{ id: string; name: string; slug: string }>;
  initialQuery?: string;
  initialCategory?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery || "");
  const [category, setCategory] = useState(initialCategory || "");
  const [minPrice, setMinPrice] = useState(initialMinPrice || "");
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice || "");

  const updateSearch = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (query) params.set("q", query); else params.delete("q");
    if (category) params.set("category", category); else params.delete("category");
    if (minPrice) params.set("minPrice", minPrice); else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice); else params.delete("maxPrice");
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="surface-card rounded-[2rem] border border-white/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Search</label>
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by product name, SKU, or description" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
          <Select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Min price</label>
          <Input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="0" type="number" min="0" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Max price</label>
          <Input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="500" type="number" min="0" />
        </div>
        <div className="flex gap-3">
          <Button type="button" onClick={updateSearch}>
            Apply
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setQuery("");
              setCategory("");
              setMinPrice("");
              setMaxPrice("");
              router.push(pathname);
            }}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
