// Creates a new user with the email already confirmed, bypassing the
// signup/confirmation email flow entirely (useful when outbound email is
// broken, e.g. Resend rejecting the recipient in dev).
//
// Usage: npm run create-confirmed-user -- someone@example.com "somePassword123"
// Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in the environment.
// Run this yourself so the password isn't shared elsewhere.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.",
  );
}

const email = process.argv[2];
const password = process.argv[3];
if (!email || !password) {
  throw new Error(
    'Usage: npm run create-confirmed-user -- someone@example.com "somePassword123"',
  );
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: email.toLowerCase(),
    password,
    email_confirm: true,
  });

  if (error) {
    throw new Error(`Failed to create ${email}: ${error.message}`);
  }

  console.log(`${data.user.email} (${data.user.id}) created and confirmed.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
