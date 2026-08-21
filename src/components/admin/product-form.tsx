"use client";

import { useActionState } from "react";
import {
  createProduct,
  updateProduct,
  type ProductActionState,
} from "@/lib/admin/products-actions";
import type { Category } from "@/lib/catalog";
import type { AdminProductDetail } from "@/lib/admin/products";

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: AdminProductDetail;
}) {
  const action = product
    ? (state: ProductActionState | undefined, formData: FormData) =>
        updateProduct(product.id, state, formData)
    : createProduct;

  const [state, formAction, pending] = useActionState<ProductActionState | undefined, FormData>(
    action,
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
          defaultValue={product?.name}
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Slug
        <input
          type="text"
          name="slug"
          placeholder={product ? undefined : "auto from name"}
          defaultValue={product?.slug}
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Description
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Category
        <select
          name="categoryId"
          defaultValue={product?.categoryId ?? ""}
          className="rounded border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="">None</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Price
          <input
            type="number"
            name="price"
            step="0.01"
            min="0"
            required
            defaultValue={product?.price}
            className="rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Sale price
          <input
            type="number"
            name="salePrice"
            step="0.01"
            min="0"
            defaultValue={product?.salePrice ?? ""}
            className="rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Currency
          <input
            type="text"
            name="currency"
            defaultValue={product?.currency ?? "usd"}
            className="rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="freeShipping"
          defaultChecked={product?.freeShipping ?? false}
        />
        Free shipping
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} />
        Active (visible in the store)
      </label>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-white px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50"
      >
        {pending ? "Saving..." : product ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
