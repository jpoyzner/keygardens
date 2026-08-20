import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Your account</h1>
      <p className="text-zinc-600">Signed in as {user?.email}</p>
      <form action={signOut}>
        <button type="submit" className="rounded border border-zinc-300 px-4 py-2">
          Sign out
        </button>
      </form>
    </div>
  );
}
