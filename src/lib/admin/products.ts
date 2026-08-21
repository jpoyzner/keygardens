import { createClient } from "@/lib/supabase/server";
import { publicImageUrl } from "@/lib/catalog";

export interface AdminProductSummary {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  isActive: boolean;
  categoryName: string | null;
}

export interface AdminProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface AdminProductDetail {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  currency: string;
  freeShipping: boolean;
  isActive: boolean;
  categoryId: string | null;
  images: AdminProductImage[];
}

interface AdminProductRow {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  is_active: boolean;
  categories: { name: string } | null;
}

// Admin sees every product (active or not) — the products SELECT policy grants
// this to admins via `is_active or public.is_admin()`.
export async function getAdminProducts(): Promise<AdminProductSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, price, currency, is_active, categories(name)")
    .order("name", { ascending: true });
  if (error) throw new Error(`Failed to load products: ${error.message}`);

  const rows = (data ?? []) as unknown as AdminProductRow[];
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price,
    currency: row.currency,
    isActive: row.is_active,
    categoryName: row.categories?.name ?? null,
  }));
}

export async function getAdminProductById(id: string): Promise<AdminProductDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, description, price, sale_price, currency, free_shipping, is_active, category_id, product_images(id, storage_path, alt_text, sort_order)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load product: ${error.message}`);
  if (!data) return null;

  const images = [...data.product_images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => ({
      id: image.id,
      url: publicImageUrl(supabase, image.storage_path),
      altText: image.alt_text,
      sortOrder: image.sort_order,
    }));

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    description: data.description,
    price: data.price,
    salePrice: data.sale_price,
    currency: data.currency,
    freeShipping: data.free_shipping,
    isActive: data.is_active,
    categoryId: data.category_id,
    images,
  };
}
