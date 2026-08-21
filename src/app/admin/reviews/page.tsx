import Link from "next/link";
import { getAdminReviews } from "@/lib/admin/reviews";
import { deleteReview } from "@/lib/admin/reviews-actions";
import { StarRating } from "@/components/star-rating";

export const metadata = { title: "Admin — Reviews" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Reviews</h1>

      <ul className="flex flex-col gap-3">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="flex flex-col gap-2 rounded border border-zinc-200 px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <Link
                href={`/products/${review.productSlug}`}
                className="text-sm font-medium underline"
              >
                {review.productName}
              </Link>
              <span className="text-xs text-zinc-500">{formatDate(review.createdAt)}</span>
            </div>
            <StarRating rating={review.rating} />
            <p className="text-sm text-zinc-700">{review.body}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">by {review.reviewerName}</span>
              <form action={deleteReview.bind(null, review.id, review.productSlug)}>
                <button type="submit" className="text-xs text-red-600 underline">
                  Remove review
                </button>
              </form>
            </div>
          </li>
        ))}
        {reviews.length === 0 && <p className="text-sm text-zinc-600">No reviews yet.</p>}
      </ul>
    </div>
  );
}
