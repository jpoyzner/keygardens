import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  return children;
}
