"use client";

import { useState, useTransition } from "react";
import { useCart } from "@/lib/cart/cart-context";
import { createCheckoutSession } from "@/lib/checkout/actions";

export function CheckoutButton() {
  const { items } = useCart();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCheckout() {
    setError(null);
    startTransition(async () => {
      const result = await createCheckoutSession(items);
      // Only reached on failure — success redirects away from this page.
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={pending || items.length === 0}
        className="self-end rounded bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
      >
        {pending ? "Redirecting to checkout…" : "Checkout"}
      </button>
    </div>
  );
}
