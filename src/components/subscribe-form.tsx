"use client";

import { useActionState } from "react";
import { subscribe, type SubscribeActionState } from "@/lib/subscribers/actions";

export function SubscribeForm() {
  const [state, formAction, pending] = useActionState<SubscribeActionState | undefined, FormData>(
    subscribe,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <label className="sr-only" htmlFor="subscribe-email">
        Email address
      </label>
      <input
        id="subscribe-email"
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        className="rounded border border-zinc-300 px-3 py-2 text-sm sm:flex-1"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Subscribing..." : "Notify me"}
      </button>
      {state?.error && <p className="text-sm text-red-600 sm:basis-full">{state.error}</p>}
      {state?.message && <p className="text-sm text-emerald-600 sm:basis-full">{state.message}</p>}
    </form>
  );
}
