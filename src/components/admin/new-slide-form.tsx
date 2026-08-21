"use client";

import { useActionState } from "react";
import { createSlide, type SlideActionState } from "@/lib/admin/coming-soon-actions";

export function NewSlideForm() {
  const [state, formAction, pending] = useActionState<SlideActionState | undefined, FormData>(
    createSlide,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-xs">
        Image file
        <input type="file" name="file" accept="image/*" required className="text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        Caption
        <input
          type="text"
          name="caption"
          className="rounded border border-zinc-300 px-2 py-1 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Uploading..." : "Add slide"}
      </button>
      {state?.error && <p className="basis-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
