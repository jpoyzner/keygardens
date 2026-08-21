"use client";

import { useCart } from "@/lib/cart/cart-context";

export function CartIndicator() {
  const { totalQuantity } = useCart();
  if (totalQuantity === 0) return null;

  return (
    <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white">
      Cart · {totalQuantity}
    </span>
  );
}
