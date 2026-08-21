import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.is_admin ?? false;
  }

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
      <Link href="/" className="font-semibold">
        Keygardens
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/products" className="underline">
          Products
        </Link>
        {user ? (
          <>
            {isAdmin && (
              <Link href="/admin" className="underline">
                Admin
              </Link>
            )}
            <Link href="/account" className="underline">
              Account
            </Link>
            <form action={signOut}>
              <button type="submit" className="underline">
                Sign out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="underline">
              Sign in
            </Link>
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
