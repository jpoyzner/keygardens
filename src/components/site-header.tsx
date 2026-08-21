import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import { CartIndicator } from "@/components/cart-indicator";
import { SearchBar } from "@/components/search-bar";

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
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white bg-[#1d1d1b] px-6 py-2 text-white">
      <Link href="/" className="flex items-center">
        <Image
          src="/logo.png"
          alt="Keygardens"
          width={1034}
          height={312}
          className="h-12 w-auto object-contain"
        />
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/products" className="underline">
          Products
        </Link>
        <Link href="/coming-soon" className="underline">
          Coming soon
        </Link>
        <Link href="/contact" className="underline">
          Contact
        </Link>
        <SearchBar />
        <CartIndicator />
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
