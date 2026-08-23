"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export function SearchBar({ inputClassName }: { inputClassName?: string } = {}) {
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  return (
    <form action="/search" method="GET" className="flex items-center">
      <label htmlFor="search-q" className="sr-only">
        Search products
      </label>
      <div className="relative flex w-full items-center">
        <input
          id="search-q"
          name="q"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search products…"
          className={
            inputClassName ??
            "w-32 rounded border border-zinc-300 px-2 py-1.5 pr-6 text-sm focus:w-48 sm:w-40"
          }
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Clear search"
            className="absolute right-1.5 text-white"
          >
            ×
          </button>
        )}
      </div>
    </form>
  );
}
