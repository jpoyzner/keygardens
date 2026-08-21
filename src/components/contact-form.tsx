"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactActionState } from "@/lib/contact/actions";

export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactActionState | undefined, FormData>(
    submitContactForm,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          type="text"
          name="name"
          required
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          type="email"
          name="email"
          required
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Message
        <textarea
          name="message"
          required
          rows={5}
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
        {pending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
