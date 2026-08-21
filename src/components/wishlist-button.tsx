"use client";

import { useActionState } from "react";
import Link from "next/link";
import { toggleWishlist, type WishlistActionState } from "@/lib/wishlist/actions";

export function WishlistButton({
  productId,
  slug,
  initialWishlisted,
  isSignedIn,
}: {
  productId: string;
  slug: string;
  initialWishlisted: boolean;
  isSignedIn: boolean;
}) {
  function action(state: WishlistActionState | undefined, formData: FormData) {
    return toggleWishlist(productId, slug, initialWishlisted, state, formData);
  }
  const [state, formAction, pending] = useActionState(action, undefined);

  if (!isSignedIn) {
    return (
      <Link href={`/login?next=/products/${slug}`} className="text-sm text-zinc-300 underline">
        Sign in to save
      </Link>
    );
  }

  const wishlisted = state?.wishlisted ?? initialWishlisted;

  return (
    <div className="flex flex-col gap-1">
      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          aria-pressed={wishlisted}
          className="rounded border border-zinc-600 px-4 py-2.5 text-sm font-medium whitespace-nowrap hover:border-zinc-500 disabled:opacity-50"
        >
          {wishlisted ? "♥ Saved" : "♡ Save for later"}
        </button>
      </form>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </div>
  );
}
