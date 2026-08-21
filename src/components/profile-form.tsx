"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileActionState } from "@/lib/account/actions";

export function ProfileForm({ fullName }: { fullName: string | null }) {
  const [state, formAction, pending] = useActionState<ProfileActionState | undefined, FormData>(
    updateProfile,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Full name
        <input
          type="text"
          name="fullName"
          defaultValue={fullName ?? ""}
          placeholder="Your name"
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.message && <p className="text-sm text-emerald-600">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
