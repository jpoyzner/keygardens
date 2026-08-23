// Confirms an existing user's email (auth.users.email_confirmed_at) without
// requiring them to click the confirmation link sent by the email flow.
//
// Usage: npm run confirm-user -- someone@example.com
// Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in the environment.
// The user must have already signed up (via /signup) before running this.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.",
  );
}

const email = process.argv[2];
if (!email) {
  throw new Error("Usage: npm run confirm-user -- someone@example.com");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // Supabase Auth normalizes emails to lowercase, so match case-insensitively.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (profileError) {
    throw new Error(`Failed to look up profile for ${email}: ${profileError.message}`);
  }
  if (!profile) {
    throw new Error(`No profile found for ${email}. Sign up first, then re-run this script.`);
  }

  const { data, error } = await supabase.auth.admin.updateUserById(profile.id, {
    email_confirm: true,
  });

  if (error) {
    throw new Error(`Failed to confirm ${email}: ${error.message}`);
  }

  console.log(`${data.user.email} (${data.user.id}) is now confirmed.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
