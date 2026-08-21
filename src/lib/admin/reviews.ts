import { createClient } from "@/lib/supabase/server";

export interface AdminReview {
  id: string;
  rating: number;
  body: string | null;
  reviewerName: string;
  createdAt: string;
  productId: string;
  productName: string;
  productSlug: string;
}

interface AdminReviewRow {
  id: string;
  rating: number;
  body: string | null;
  reviewer_name: string;
  created_at: string;
  product_id: string;
  products: { name: string; slug: string } | null;
}

export async function getAdminReviews(): Promise<AdminReview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, rating, body, reviewer_name, created_at, product_id, products(name, slug)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load reviews: ${error.message}`);

  const rows = (data ?? []) as unknown as AdminReviewRow[];
  return rows.map((row) => ({
    id: row.id,
    rating: row.rating,
    body: row.body,
    reviewerName: row.reviewer_name,
    createdAt: row.created_at,
    productId: row.product_id,
    productName: row.products?.name ?? "Unknown product",
    productSlug: row.products?.slug ?? "",
  }));
}
