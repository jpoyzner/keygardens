"use server";

import { createClient } from "@/lib/supabase/server";
import { sendSubscriptionConfirmation } from "@/lib/email";

export interface SubscribeActionState {
  error?: string;
  message?: string;
}

export async function subscribe(
  _state: SubscribeActionState | undefined,
  formData: FormData,
): Promise<SubscribeActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Enter your email address." };
  }

  const supabase = await createClient();
  // Plain insert (not upsert): the "Anyone can subscribe" RLS policy only
  // grants insert, not update, so an upsert's ON CONFLICT DO UPDATE would be
  // rejected. Treat a duplicate email (unique violation) as success instead.
  const { error } = await supabase.from("subscribers").insert({ email });
  if (error && error.code !== "23505") {
    return { error: "Could not subscribe. Please try again." };
  }

  await sendSubscriptionConfirmation(email);

  return { message: "You're subscribed! Watch your inbox for updates." };
}
