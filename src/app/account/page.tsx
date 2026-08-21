import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import { ProfileForm } from "@/components/profile-form";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 rounded-lg border border-white bg-black my-8 px-4 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Your account</h1>
        <p className="text-zinc-200">Signed in as {user?.email}</p>
      </div>

      <ProfileForm fullName={profile?.full_name ?? null} />

      <div className="flex flex-col gap-2 border-t border-zinc-700 pt-6 text-sm">
        <Link href="/account/orders" className="underline">
          Order history
        </Link>
        <Link href="/account/wishlist" className="underline">
          Wishlist
        </Link>
      </div>

      <form action={signOut}>
        <button type="submit" className="rounded border border-zinc-600 px-4 py-2">
          Sign out
        </button>
      </form>
    </div>
  );
}
