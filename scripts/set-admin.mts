// Marks an existing user's profile as an admin (is_admin = true).
//
// Usage: npm run make-admin -- someone@example.com
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
  throw new Error("Usage: npm run make-admin -- someone@example.com");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data, error } = await supabase
    .from("profiles")
    .update({ is_admin: true })
    .eq("email", email)
    .select("id, email")
    .single();

  if (error) {
    throw new Error(`Failed to update profile for ${email}: ${error.message}`);
  }
  if (!data) {
    throw new Error(`No profile found for ${email}. Sign up first, then re-run this script.`);
  }

  console.log(`${data.email} (${data.id}) is now an admin.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
