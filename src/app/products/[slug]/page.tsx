import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const onSale = product.salePrice != null && product.salePrice < product.price;
  const primaryImage = product.images[0];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:flex-row">
      <div className="relative aspect-square w-full flex-1 overflow-hidden rounded bg-zinc-100 sm:max-w-md">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <h1 className="text-2xl font-semibold capitalize">{product.name}</h1>
        {product.categoryName && (
          <span className="text-sm text-zinc-500 capitalize">{product.categoryName}</span>
        )}
        <div className="flex items-center gap-2 text-lg">
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
            <span className="font-semibold text-zinc-900">
              {formatPrice(product.price, product.currency)}
            </span>
          )}
        </div>
        {product.freeShipping && <span className="text-sm text-emerald-600">Free shipping</span>}
        {product.description && <p className="text-zinc-600">{product.description}</p>}
      </div>
    </div>
  );
}
