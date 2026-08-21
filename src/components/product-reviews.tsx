import { StarRating } from "@/components/star-rating";
import { ReviewForm } from "@/components/review-form";
import type { ProductReviewSummary } from "@/lib/catalog";

export function ProductReviews({
  productId,
  slug,
  summary,
  currentUserId,
}: {
  productId: string;
  slug: string;
  summary: ProductReviewSummary;
  currentUserId: string | null;
}) {
  const { reviews, averageRating, count } = summary;
  const existingReview = currentUserId
    ? (reviews.find((review) => review.userId === currentUserId) ?? null)
    : null;
  const otherReviews = existingReview
    ? reviews.filter((review) => review.id !== existingReview.id)
    : reviews;

  return (
    <section className="flex flex-col gap-6 border-t border-zinc-200 pt-8">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Reviews</h2>
        {count > 0 ? (
          <>
            <StarRating rating={averageRating} />
            <span className="text-sm text-zinc-500">
              {averageRating.toFixed(1)} out of 5 ({count} {count === 1 ? "review" : "reviews"})
            </span>
          </>
        ) : (
          <span className="text-sm text-zinc-500">No reviews yet</span>
        )}
      </div>

      {currentUserId ? (
        <ReviewForm productId={productId} slug={slug} existingReview={existingReview} />
      ) : (
        <p className="text-sm text-zinc-500">
          <a href="/login" className="underline">
            Sign in
          </a>{" "}
          to leave a review.
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {existingReview && (
          <li className="flex flex-col gap-1 rounded border border-zinc-200 p-4">
            <div className="flex items-center gap-2">
              <StarRating rating={existingReview.rating} size="text-sm" />
              <span className="text-sm font-medium">{existingReview.reviewerName} (you)</span>
            </div>
            {existingReview.body && <p className="text-sm text-zinc-600">{existingReview.body}</p>}
          </li>
        )}
        {otherReviews.map((review) => (
          <li key={review.id} className="flex flex-col gap-1 rounded border border-zinc-200 p-4">
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} size="text-sm" />
              <span className="text-sm font-medium">{review.reviewerName}</span>
            </div>
            {review.body && <p className="text-sm text-zinc-600">{review.body}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
