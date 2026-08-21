import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles Supabase email links (signup confirmation, password recovery, etc.)
// which point at /auth/confirm?token_hash=...&type=...&next=...
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  } else {
    // Falls through here if the email template links to Supabase's own hosted
    // verify endpoint instead of straight to this route with token_hash/type —
    // that endpoint verifies the token before redirecting, so don't show a
    // false "invalid link" error if the user already ended up signed in.
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=invalid-link`);
}
