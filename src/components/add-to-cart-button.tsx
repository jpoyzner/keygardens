"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/cart-context";
import type { ProductDetail } from "@/lib/catalog";

export function AddToCartButton({ product }: { product: ProductDetail }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    const price = product.salePrice ?? product.price;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price,
        currency: product.currency,
        imageUrl: product.imageUrl,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
        aria-label="Quantity"
        className="w-16 rounded border border-zinc-300 px-2 py-2 text-sm"
      />
      <button
        type="button"
        onClick={handleAdd}
        className="rounded bg-white px-5 py-2.5 text-sm font-medium whitespace-nowrap text-zinc-900 hover:bg-zinc-200"
      >
        {added ? "Added ✓" : "Add to cart"}
      </button>
    </div>
  );
}
