import { createClient } from "@/lib/supabase/server";
import { COMING_SOON_BUCKET } from "@/lib/coming-soon";

export interface AdminComingSoonSlide {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  isActive: boolean;
}

// Admin sees every slide (active or not) — the coming_soon_items SELECT policy
// grants this via `is_active or public.is_admin()`.
export async function getAdminComingSoonSlides(): Promise<AdminComingSoonSlide[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coming_soon_items")
    .select("id, storage_path, caption, sort_order, is_active")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Failed to load coming-soon slides: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    url: supabase.storage.from(COMING_SOON_BUCKET).getPublicUrl(row.storage_path).data.publicUrl,
    caption: row.caption,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  }));
}
