import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/lib/catalog";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function ProductCard({ product }: { product: ProductSummary }) {
  const onSale = product.salePrice != null && product.salePrice < product.price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col gap-2 rounded-lg border border-white bg-black p-3 transition-colors hover:border-zinc-500"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded bg-zinc-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.imageAlt ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            No image
          </div>
        )}
        {onSale && (
          <span className="absolute top-2 left-2 rounded bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
            Sale
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-white capitalize">{product.name}</span>
        {product.categoryName && (
          <span className="text-xs text-zinc-300 capitalize">{product.categoryName}</span>
        )}
        <div className="flex items-center gap-2 text-sm">
          {onSale ? (
            <>
              <span className="font-semibold text-red-600">
                {formatPrice(product.salePrice!, product.currency)}
              </span>
              <span className="text-zinc-400 line-through">
                {formatPrice(product.price, product.currency)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-white">
              {formatPrice(product.price, product.currency)}
            </span>
          )}
        </div>
        {product.freeShipping && <span className="text-xs text-emerald-600">Free shipping</span>}
      </div>
    </Link>
  );
}
