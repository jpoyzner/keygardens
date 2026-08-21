"use client";

import { useActionState, useState } from "react";
import { submitReview, type ReviewActionState } from "@/lib/reviews/actions";
import type { ProductReview } from "@/lib/catalog";

export function ReviewForm({
  productId,
  slug,
  existingReview,
}: {
  productId: string;
  slug: string;
  existingReview: ProductReview | null;
}) {
  function action(state: ReviewActionState | undefined, formData: FormData) {
    return submitReview(productId, slug, state, formData);
  }
  const [state, formAction, pending] = useActionState(action, undefined);
  const [rating, setRating] = useState(existingReview?.rating ?? 5);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded border border-zinc-200 p-4">
      <h3 className="text-sm font-semibold">
        {existingReview ? "Edit your review" : "Leave a review"}
      </h3>
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} star${value === 1 ? "" : "s"}`}
            onClick={() => setRating(value)}
            className={`text-2xl leading-none ${value <= rating ? "text-amber-500" : "text-zinc-300"}`}
          >
            ★
          </button>
        ))}
        <input type="hidden" name="rating" value={rating} />
      </div>
      <textarea
        name="body"
        defaultValue={existingReview?.body ?? ""}
        placeholder="Share your thoughts about this product..."
        rows={3}
        className="rounded border border-zinc-300 px-3 py-2 text-sm"
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.message && <p className="text-sm text-emerald-600">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Submitting..." : existingReview ? "Update review" : "Submit review"}
      </button>
    </form>
  );
}
