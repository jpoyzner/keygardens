import { createClient } from "@/lib/supabase/server";

export const COMING_SOON_BUCKET = "coming-soon-images";

export interface ComingSoonSlide {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  isActive: boolean;
}

// Public read: only active slides, for the /coming-soon page.
export async function getComingSoonSlides(): Promise<ComingSoonSlide[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coming_soon_items")
    .select("id, storage_path, caption, sort_order, is_active")
    .eq("is_active", true)
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
