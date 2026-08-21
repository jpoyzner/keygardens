import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories } from "@/lib/catalog";
import { getAdminProductById } from "@/lib/admin/products";
import { deleteProduct } from "@/lib/admin/products-actions";
import { ProductForm } from "@/components/admin/product-form";
import { ProductImageManager } from "@/components/admin/product-image-manager";

export const metadata = { title: "Admin — Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [categories, product] = await Promise.all([getCategories(), getAdminProductById(id)]);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit product</h1>
        <Link href="/admin/products" className="text-sm underline">
          Back to products
        </Link>
      </div>

      <ProductForm categories={categories} product={product} />

      <div className="flex flex-col gap-3 border-t border-zinc-700 pt-6">
        <h2 className="text-lg font-medium">Images</h2>
        <ProductImageManager
          productId={product.id}
          productSlug={product.slug}
          images={product.images}
        />
      </div>

      <form action={deleteProduct.bind(null, product.id)} className="border-t border-zinc-700 pt-6">
        <button type="submit" className="text-sm text-red-600 underline">
          Delete product
        </button>
      </form>
    </div>
  );
}
