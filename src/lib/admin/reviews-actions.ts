"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteReview(reviewId: string, productSlug: string) {
  const supabase = await createClient();
  await supabase.from("product_reviews").delete().eq("id", reviewId);

  revalidatePath("/admin/reviews");
  if (productSlug) revalidatePath(`/products/${productSlug}`);
}
