"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ProfileActionState {
  error?: string;
  message?: string;
}

export async function updateProfile(
  _state: ProfileActionState | undefined,
  formData: FormData,
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sign in to update your profile." };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName || null })
    .eq("id", user.id);
  if (error) {
    return { error: "Could not save your profile. Please try again." };
  }

  revalidatePath("/account");
  return { message: "Profile updated." };
}
