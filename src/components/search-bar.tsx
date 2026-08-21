"use client";

import { useSearchParams } from "next/navigation";

export function SearchBar() {
  const searchParams = useSearchParams();
  const defaultValue = searchParams.get("q") ?? "";

  return (
    <form action="/search" method="GET" className="flex items-center">
      <label htmlFor="search-q" className="sr-only">
        Search products
      </label>
      <input
        id="search-q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Search products…"
        className="w-32 rounded border border-zinc-300 px-2 py-1.5 text-sm focus:w-48 focus:outline-none focus:ring-2 focus:ring-white sm:w-40"
      />
    </form>
  );
}
