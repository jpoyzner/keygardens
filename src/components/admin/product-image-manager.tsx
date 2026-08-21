"use client";

import Image from "next/image";
import { useActionState } from "react";
import {
  addProductImage,
  deleteProductImage,
  type ProductActionState,
} from "@/lib/admin/products-actions";
import type { AdminProductImage } from "@/lib/admin/products";

export function ProductImageManager({
  productId,
  productSlug,
  images,
}: {
  productId: string;
  productSlug: string;
  images: AdminProductImage[];
}) {
  const [state, formAction, pending] = useActionState<ProductActionState | undefined, FormData>(
    (state, formData) => addProductImage(productId, productSlug, state, formData),
    undefined,
  );

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((image) => (
          <li key={image.id} className="flex flex-col gap-2">
            <div className="relative aspect-square overflow-hidden rounded border border-zinc-700">
              <Image
                src={image.url}
                alt={image.altText ?? ""}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
            <form action={deleteProductImage.bind(null, image.id, productId, productSlug)}>
              <button type="submit" className="text-xs text-red-600 underline">
                Remove
              </button>
            </form>
          </li>
        ))}
        {images.length === 0 && (
          <p className="col-span-full text-sm text-zinc-200">No images yet.</p>
        )}
      </ul>

      <form action={formAction} className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs">
          Image file
          <input type="file" name="file" accept="image/*" required className="text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Alt text
          <input
            type="text"
            name="altText"
            className="rounded border border-zinc-300 px-2 py-1 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Sort order
          <input
            type="number"
            name="sortOrder"
            defaultValue={images.length}
            className="w-20 rounded border border-zinc-300 px-2 py-1 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 disabled:opacity-50"
        >
          {pending ? "Uploading..." : "Upload image"}
        </button>
        {state?.error && <p className="basis-full text-sm text-red-600">{state.error}</p>}
      </form>
    </div>
  );
}
