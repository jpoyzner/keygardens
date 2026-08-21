"use server";

import { createClient } from "@/lib/supabase/server";
import { sendContactNotification } from "@/lib/email";

export interface ContactActionState {
  error?: string;
  message?: string;
}

export async function submitContactForm(
  _state: ContactActionState | undefined,
  formData: FormData,
): Promise<ContactActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { error: "Please fill in your name, email, and message." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_submissions").insert({ name, email, message });
  if (error) {
    return { error: "Could not send your message. Please try again." };
  }

  await sendContactNotification({ name, email, message });

  return { message: "Thanks for reaching out! We'll get back to you soon." };
}
