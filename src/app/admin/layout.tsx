import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/coming-soon", label: "Coming soon" },
];

// Defense in depth: proxy.ts already redirects non-admins away from /admin,
// but every protected segment re-checks here too.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 rounded-lg border border-white bg-black my-8 px-4 py-8">
      <nav className="flex flex-wrap gap-4 border-b border-zinc-700 pb-4 text-sm">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="underline">
            {link.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
