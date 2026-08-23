"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";

export default function CheckoutSuccessPage() {
  const { clear } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (cleared.current) return;
    cleared.current = true;
    clear();
  }, [clear]);

  return (
    <div className="mx-auto my-8 flex w-full max-w-2xl flex-1 flex-col gap-4 rounded-lg border border-white bg-black px-4 py-8">
      <h1 className="text-2xl font-semibold">Thanks for your order!</h1>
      <p className="text-zinc-200">
        Your payment was successful. We&apos;ve sent a receipt to your email, and you can track its
        status from your account once it ships.
      </p>
      <div className="flex gap-4">
        <Link href="/account/orders" className="underline">
          View your orders
        </Link>
        <Link href="/products" className="underline">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
