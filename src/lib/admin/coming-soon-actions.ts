"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { COMING_SOON_BUCKET } from "@/lib/coming-soon";

export interface SlideActionState {
  error?: string;
}

export async function createSlide(
  _state: SlideActionState | undefined,
  formData: FormData,
): Promise<SlideActionState> {
  const file = formData.get("file");
  const caption = String(formData.get("caption") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file to upload." };
  }

  const supabase = await createClient();

  const { count } = await supabase
    .from("coming_soon_items")
    .select("id", { count: "exact", head: true });

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const storagePath = `${randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(COMING_SOON_BUCKET)
    .upload(storagePath, file, { contentType: file.type || "application/octet-stream" });
  if (uploadError) {
    return { error: `Could not upload image: ${uploadError.message}` };
  }

  const { error } = await supabase.from("coming_soon_items").insert({
    storage_path: storagePath,
    caption: caption || null,
    sort_order: count ?? 0,
  });
  if (error) {
    await supabase.storage.from(COMING_SOON_BUCKET).remove([storagePath]);
    return { error: `Could not save slide: ${error.message}` };
  }

  revalidatePath("/admin/coming-soon");
  revalidatePath("/coming-soon");
  return {};
}

export async function updateSlideCaption(
  id: string,
  _state: SlideActionState | undefined,
  formData: FormData,
): Promise<SlideActionState> {
  const caption = String(formData.get("caption") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("coming_soon_items")
    .update({ caption: caption || null })
    .eq("id", id);
  if (error) {
    return { error: `Could not update slide: ${error.message}` };
  }

  revalidatePath("/admin/coming-soon");
  revalidatePath("/coming-soon");
  return {};
}

export async function toggleSlideActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("coming_soon_items").update({ is_active: !isActive }).eq("id", id);

  revalidatePath("/admin/coming-soon");
  revalidatePath("/coming-soon");
}

export async function deleteSlide(id: string) {
  const supabase = await createClient();
  const { data: slide } = await supabase
    .from("coming_soon_items")
    .select("storage_path")
    .eq("id", id)
    .single();

  await supabase.from("coming_soon_items").delete().eq("id", id);
  if (slide?.storage_path) {
    await supabase.storage.from(COMING_SOON_BUCKET).remove([slide.storage_path]);
  }

  revalidatePath("/admin/coming-soon");
  revalidatePath("/coming-soon");
}

// Swaps sort_order with the adjacent slide in the given direction.
export async function moveSlide(id: string, direction: "up" | "down") {
  const supabase = await createClient();
  const { data: slides } = await supabase
    .from("coming_soon_items")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });
  if (!slides) return;

  const currentIndex = slides.findIndex((slide) => slide.id === id);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (currentIndex === -1 || targetIndex < 0 || targetIndex >= slides.length) return;

  const current = slides[currentIndex];
  const target = slides[targetIndex];

  await Promise.all([
    supabase
      .from("coming_soon_items")
      .update({ sort_order: target.sort_order })
      .eq("id", current.id),
    supabase
      .from("coming_soon_items")
      .update({ sort_order: current.sort_order })
      .eq("id", target.id),
  ]);

  revalidatePath("/admin/coming-soon");
  revalidatePath("/coming-soon");
}
