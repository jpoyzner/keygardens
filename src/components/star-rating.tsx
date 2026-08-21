export function StarRating({ rating, size = "text-base" }: { rating: number; size?: string }) {
  const rounded = Math.round(rating);
  return (
    <span className={`text-amber-500 ${size}`} aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {"★".repeat(rounded)}
      <span className="text-zinc-300">{"★".repeat(5 - rounded)}</span>
    </span>
  );
}
