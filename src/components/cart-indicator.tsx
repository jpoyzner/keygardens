"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";

export function CartIndicator() {
  const { totalQuantity } = useCart();

  return (
    <Link href="/cart" className="underline">
      Cart{totalQuantity > 0 ? ` · ${totalQuantity}` : ""}
    </Link>
  );
}
