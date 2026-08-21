"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface WishlistActionState {
  error?: string;
  wishlisted: boolean;
}

export async function toggleWishlist(
  productId: string,
  slug: string,
  currentlyWishlisted: boolean,
  state: WishlistActionState | undefined,
  // Required by the useActionState action signature; this toggle has no form fields.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<WishlistActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: "Sign in to save favorites.",
      wishlisted: state?.wishlisted ?? currentlyWishlisted,
    };
  }

  const wishlisted = state?.wishlisted ?? currentlyWishlisted;

  if (wishlisted) {
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    if (error) return { error: "Could not update your wishlist.", wishlisted: true };
  } else {
    const { error } = await supabase
      .from("wishlist_items")
      .insert({ user_id: user.id, product_id: productId });
    if (error) return { error: "Could not update your wishlist.", wishlisted: false };
  }

  revalidatePath(`/products/${slug}`);
  revalidatePath("/account/wishlist");
  return { wishlisted: !wishlisted };
}
