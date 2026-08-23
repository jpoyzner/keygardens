import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const PRODUCT_IMAGES_BUCKET = "product-images";

export const SORT_OPTIONS = ["popularity", "newest", "price-asc", "price-desc", "name"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const DEFAULT_SORT: SortOption = "newest";

export function isSortOption(value: string | undefined): value is SortOption {
  return !!value && (SORT_OPTIONS as readonly string[]).includes(value);
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  price: number;
  salePrice: number | null;
  currency: string;
  freeShipping: boolean;
  categorySlug: string | null;
  categoryName: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  reviewCount: number;
  createdAt: string;
}

export interface ProductDetail extends ProductSummary {
  description: string | null;
  images: { url: string; alt: string | null }[];
}

export interface ProductReview {
  id: string;
  userId: string;
  rating: number;
  body: string | null;
  reviewerName: string;
  createdAt: string;
}

export interface ProductReviewSummary {
  reviews: ProductReview[];
  averageRating: number;
  count: number;
}

export function publicImageUrl(supabase: SupabaseClient, storagePath: string): string {
  return supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Failed to load categories: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    sortOrder: row.sort_order,
  }));
}

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  price: number;
  sale_price: number | null;
  currency: string;
  free_shipping: boolean;
  created_at: string;
  categories: { slug: string; name: string } | null;
  product_images: { storage_path: string; alt_text: string | null; sort_order: number }[];
  product_reviews: { count: number }[];
}

function toProductSummary(supabase: SupabaseClient, row: ProductRow): ProductSummary {
  const primaryImage = [...row.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price,
    salePrice: row.sale_price,
    currency: row.currency,
    freeShipping: row.free_shipping,
    categorySlug: row.categories?.slug ?? null,
    categoryName: row.categories?.name ?? null,
    imageUrl: primaryImage ? publicImageUrl(supabase, primaryImage.storage_path) : null,
    imageAlt: primaryImage?.alt_text ?? null,
    reviewCount: row.product_reviews[0]?.count ?? 0,
    createdAt: row.created_at,
  };
}

export async function getProducts(options?: {
  categorySlug?: string;
  sort?: SortOption;
}): Promise<ProductSummary[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(
      "id, slug, name, price, sale_price, currency, free_shipping, created_at, categories(slug, name), product_images(storage_path, alt_text, sort_order), product_reviews(count)",
    )
    .eq("is_active", true);

  const sort = options?.sort ?? DEFAULT_SORT;
  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    case "newest":
    case "popularity":
      // Popularity has no dedicated metric yet (no order history) — falls back to
      // review count client-side below, with newest as the tiebreaker/default.
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load products: ${error.message}`);

  // Cast via `unknown`: this client has no generated Database types, so the query
  // builder can't infer relationship cardinality (it types every embed as an array).
  const allRows = (data ?? []) as unknown as ProductRow[];
  const summaries = allRows.map((row) => toProductSummary(supabase, row));

  // Filtering embedded `categories` columns via PostgREST only filters which
  // embedded rows are returned, not the parent rows — so filter by category here instead.
  const filtered = filterProductsByCategory(summaries, options?.categorySlug);

  return sort === "popularity" ? sortByPopularity(filtered) : filtered;
}

export function filterProductsByCategory<T extends { categorySlug: string | null }>(
  products: T[],
  categorySlug: string | undefined,
): T[] {
  return products.filter((product) => !categorySlug || product.categorySlug === categorySlug);
}

// Popularity has no dedicated metric yet (no order history) — ranks by review
// count, highest first, as a placeholder. Returns a new array (doesn't mutate).
export function sortByPopularity<T extends { reviewCount: number }>(products: T[]): T[] {
  return [...products].sort((a, b) => b.reviewCount - a.reviewCount);
}

// v1 search predicate: true if any field contains the query as a case-insensitive
// substring. Used both for product search and can be unit-tested independent of the DB.
export function matchesSearchQuery(fields: (string | null | undefined)[], query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return false;
  return fields.some((field) => field?.toLowerCase().includes(needle));
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, description, price, sale_price, currency, free_shipping, created_at, categories(slug, name), product_images(storage_path, alt_text, sort_order), product_reviews(count)",
    )
    .eq("is_active", true)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Failed to load product "${slug}": ${error.message}`);
  if (!data) return null;

  const row = data as unknown as ProductRow & { description: string | null };
  const summary = toProductSummary(supabase, row);
  const images = [...row.product_images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => ({ url: publicImageUrl(supabase, image.storage_path), alt: image.alt_text }));

  return { ...summary, description: row.description, images };
}

export async function getProductReviews(productId: string): Promise<ProductReviewSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, user_id, rating, body, reviewer_name, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load reviews: ${error.message}`);

  const reviews: ProductReview[] = (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    rating: row.rating,
    body: row.body,
    reviewerName: row.reviewer_name,
    createdAt: row.created_at,
  }));

  const count = reviews.length;
  const averageRating = count === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / count;

  return { reviews, averageRating, count };
}

export async function getRelatedProducts(
  categorySlug: string | null,
  excludeProductId: string,
  limit = 4,
): Promise<ProductSummary[]> {
  if (!categorySlug) return [];
  const products = await getProducts({ categorySlug });
  return products.filter((product) => product.id !== excludeProductId).slice(0, limit);
}

interface WishlistRow {
  product_id: string;
  products: ProductRow;
}

// RLS ("Wishlist items are viewable by owner") already scopes this to the
// signed-in user, so no explicit user_id filter is needed here.
export async function getWishlistProducts(): Promise<ProductSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wishlist_items")
    .select(
      "product_id, created_at, products(id, slug, name, price, sale_price, currency, free_shipping, created_at, categories(slug, name), product_images(storage_path, alt_text, sort_order), product_reviews(count))",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load wishlist: ${error.message}`);

  const rows = (data ?? []) as unknown as WishlistRow[];
  return rows.filter((row) => row.products).map((row) => toProductSummary(supabase, row.products));
}

export async function isProductWishlisted(userId: string, productId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();
  if (error) throw new Error(`Failed to check wishlist: ${error.message}`);
  return !!data;
}

export async function searchProducts(query: string): Promise<ProductSummary[]> {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, description, price, sale_price, currency, free_shipping, created_at, categories(slug, name), product_images(storage_path, alt_text, sort_order), product_reviews(count)",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to search products: ${error.message}`);

  // v1 search: filter the cached active-product list in JS (name/category/description),
  // rather than a dedicated search service — revisit if the catalog grows significantly.
  const rows = (data ?? []) as unknown as (ProductRow & { description: string | null })[];
  const matches = rows.filter((row) =>
    matchesSearchQuery([row.name, row.categories?.name, row.description], needle),
  );

  return matches.map((row) => toProductSummary(supabase, row));
}
