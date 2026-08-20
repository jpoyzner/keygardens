import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Privileged Supabase client for server-only use (bypasses Row Level Security).
// Never import this into client-side code.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
