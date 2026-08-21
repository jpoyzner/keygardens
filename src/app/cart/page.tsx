"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-16">
        <h1 className="text-2xl font-semibold">Your cart</h1>
        <p className="text-zinc-600">Your cart is empty.</p>
        <Link href="/products" className="self-start underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const currency = items[0].currency;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Your cart</h1>

      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex items-center gap-4 border-b border-zinc-200 pb-4"
          >
            <div className="relative size-20 shrink-0 overflow-hidden rounded bg-zinc-100">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                  No image
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <Link href={`/products/${item.slug}`} className="text-sm font-medium capitalize">
                {item.name}
              </Link>
              <span className="text-sm text-zinc-500">
                {formatPrice(item.price, item.currency)}
              </span>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(event) =>
                updateQuantity(item.productId, Math.max(1, Number(event.target.value) || 1))
              }
              aria-label={`Quantity for ${item.name}`}
              className="w-16 rounded border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <span className="w-20 text-right text-sm font-medium">
              {formatPrice(item.price * item.quantity, item.currency)}
            </span>
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-sm text-zinc-500 underline hover:text-red-600"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-zinc-200 pt-4">
        <span className="font-semibold">Subtotal</span>
        <span className="font-semibold">{formatPrice(subtotal, currency)}</span>
      </div>

      <button
        type="button"
        disabled
        title="Checkout is coming soon"
        className="self-end rounded bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white opacity-50"
      >
        Checkout (coming soon)
      </button>
    </div>
  );
}
