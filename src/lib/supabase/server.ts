import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase client for use in Server Components, Route Handlers, and Server Actions.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll called from a Server Component — safe to ignore when
            // session refresh is handled by middleware instead.
          }
        },
      },
    },
  );
}
