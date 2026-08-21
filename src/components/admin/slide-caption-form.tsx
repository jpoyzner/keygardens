"use client";

import { useActionState } from "react";
import { updateSlideCaption, type SlideActionState } from "@/lib/admin/coming-soon-actions";

export function SlideCaptionForm({ id, caption }: { id: string; caption: string | null }) {
  const [state, formAction, pending] = useActionState<SlideActionState | undefined, FormData>(
    (state, formData) => updateSlideCaption(id, state, formData),
    undefined,
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input
        type="text"
        name="caption"
        defaultValue={caption ?? ""}
        placeholder="Caption"
        className="rounded border border-zinc-300 px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded border border-zinc-600 px-2 py-1 text-xs disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save"}
      </button>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
