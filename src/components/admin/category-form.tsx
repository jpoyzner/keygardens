"use client";

import { useActionState } from "react";
import {
  createCategory,
  updateCategory,
  type CategoryActionState,
} from "@/lib/admin/categories-actions";
import type { Category } from "@/lib/catalog";

export function CategoryForm({ category }: { category?: Category }) {
  const action = category
    ? (state: CategoryActionState | undefined, formData: FormData) =>
        updateCategory(category.id, state, formData)
    : createCategory;

  const [state, formAction, pending] = useActionState<CategoryActionState | undefined, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-xs">
        Name
        <input
          type="text"
          name="name"
          required
          defaultValue={category?.name}
          className="rounded border border-zinc-300 px-2 py-1 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        Slug
        <input
          type="text"
          name="slug"
          placeholder={category ? undefined : "auto from name"}
          defaultValue={category?.slug}
          className="rounded border border-zinc-300 px-2 py-1 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        Sort order
        <input
          type="number"
          name="sortOrder"
          defaultValue={category?.sortOrder ?? 0}
          className="w-20 rounded border border-zinc-300 px-2 py-1 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Saving..." : category ? "Save" : "Add category"}
      </button>
      {state?.error && <p className="basis-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
