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
  initialMaxPrice,
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
    <div className="surface-card rounded-lg p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_auto] xl:items-end">
        <div>
          <label className="field-label">Search</label>
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products or SKU" />
        </div>
        <div>
          <label className="field-label">Category</label>
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
          <label className="field-label">Min price</label>
          <Input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="0" type="number" min="0" />
        </div>
        <div>
          <label className="field-label">Max price</label>
          <Input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="500" type="number" min="0" />
        </div>
        <div className="flex gap-2 xl:flex-col">
          <Button type="button" onClick={updateSearch} className="flex-1 xl:flex-none">Apply</Button>
          <Button
            type="button"
            variant="secondary"
            className="flex-1 xl:flex-none"
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
