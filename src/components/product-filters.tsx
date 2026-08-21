"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category, SortOption } from "@/lib/catalog";

const SORT_LABELS: Record<SortOption, string> = {
  popularity: "Most popular",
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  name: "Alphabetical",
};

export function ProductFilters({
  categories,
  activeCategory,
  activeSort,
}: {
  categories: Category[];
  activeCategory: string;
  activeSort: SortOption;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: "category" | "sort", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    router.push(query ? `/products?${query}` : "/products");
  }

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-zinc-700 pb-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-xs font-medium text-zinc-300">
          Category
        </label>
        <select
          id="category"
          value={activeCategory}
          onChange={(event) => updateParam("category", event.target.value)}
          className="rounded border border-zinc-300 px-2 py-1.5 text-sm capitalize"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug} className="capitalize">
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="sort" className="text-xs font-medium text-zinc-300">
          Sort by
        </label>
        <select
          id="sort"
          value={activeSort}
          onChange={(event) => updateParam("sort", event.target.value)}
          className="rounded border border-zinc-300 px-2 py-1.5 text-sm"
        >
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
