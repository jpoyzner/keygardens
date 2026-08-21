"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ReviewActionState {
  error?: string;
  message?: string;
}

export async function submitReview(
  productId: string,
  slug: string,
  _state: ReviewActionState | undefined,
  formData: FormData,
): Promise<ReviewActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sign in to leave a review." };
  }

  const rating = Number(formData.get("rating"));
  const body = String(formData.get("body") ?? "").trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Choose a rating between 1 and 5 stars." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();
  const reviewerName = profile?.full_name?.trim() || profile?.email?.split("@")[0] || "Customer";

  const { error } = await supabase.from("product_reviews").upsert(
    {
      product_id: productId,
      user_id: user.id,
      rating,
      body: body || null,
      reviewer_name: reviewerName,
    },
    { onConflict: "product_id,user_id" },
  );
  if (error) {
    return { error: "Could not save your review. Please try again." };
  }

  revalidatePath(`/products/${slug}`);
  return { message: "Thanks for your review!" };
}
