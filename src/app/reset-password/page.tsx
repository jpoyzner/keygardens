import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only reachable via the link from /auth/confirm, which establishes a
  // short-lived recovery session — no session means the link is missing/expired.
  if (!user) {
    redirect("/forgot-password");
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Set a new password</h1>
      <ResetPasswordForm />
    </div>
  );
}
