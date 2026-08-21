import Link from "next/link";
import { getWishlistProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export default async function WishlistPage() {
  const products = await getWishlistProducts();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 rounded-lg border border-white bg-black my-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Wishlist</h1>
        <Link href="/account" className="text-sm underline">
          Back to account
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-zinc-200">
          You haven&apos;t saved any products yet. Tap &ldquo;Save for later&rdquo; on a product
          page to add it here.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
