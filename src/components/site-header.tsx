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

  const navLinks = (
    <>
      <Link href="/products" className="underline">
        Products
      </Link>
      <Link href="/coming-soon" className="underline">
        Coming soon
      </Link>
      <Link href="/contact" className="underline">
        Contact
      </Link>
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
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white bg-[#1d1d1b] text-white">
      <div className="relative flex items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Keygardens"
            width={1034}
            height={312}
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 text-sm sm:flex">
          {navLinks}
          <SearchBar />
        </nav>

        {/* Mobile menu toggle (CSS-only, no client JS needed) */}
        <input type="checkbox" id="nav-toggle" className="peer hidden" />
        <label
          htmlFor="nav-toggle"
          className="flex cursor-pointer flex-col gap-1.5 p-2 sm:hidden"
          aria-label="Toggle menu"
        >
          <span className="h-0.5 w-6 bg-white" />
          <span className="h-0.5 w-6 bg-white" />
          <span className="h-0.5 w-6 bg-white" />
        </label>

        {/* Mobile nav panel */}
        <nav className="absolute inset-x-0 top-full hidden flex-col gap-4 border-b border-white bg-[#1d1d1b] px-4 py-4 text-sm peer-checked:flex sm:hidden">
          <SearchBar inputClassName="w-full rounded border border-zinc-300 px-2 py-1.5 pr-6 text-sm" />
          {navLinks}
        </nav>
      </div>
    </header>
  );
}
