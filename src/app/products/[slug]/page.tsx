import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductReviews, getRelatedProducts } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import { ProductGallery } from "@/components/product-gallery";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ShareButton } from "@/components/share-button";
import { StarRating } from "@/components/star-rating";
import { ProductReviews } from "@/components/product-reviews";
import { ProductCard } from "@/components/product-card";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const title = `${product.name} — Keygardens`;
  const description = product.description ?? `Shop ${product.name} at Keygardens.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    reviewSummary,
    relatedProducts,
  ] = await Promise.all([
    supabase.auth.getUser(),
    getProductReviews(product.id),
    getRelatedProducts(product.categorySlug, product.id),
  ]);

  const onSale = product.salePrice != null && product.salePrice < product.price;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-12 px-4 py-12">
      <div className="flex flex-col gap-8 sm:flex-row">
        <div className="w-full sm:max-w-md">
          <ProductGallery images={product.images} productName={product.name} />
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <h1 className="text-2xl font-semibold capitalize">{product.name}</h1>
          {product.categoryName && (
            <span className="text-sm text-zinc-500 capitalize">{product.categoryName}</span>
          )}
          {reviewSummary.count > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={reviewSummary.averageRating} />
              <span className="text-sm text-zinc-500">({reviewSummary.count})</span>
            </div>
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

          <div className="mt-2 flex items-center gap-3">
            <AddToCartButton product={product} />
            <ShareButton title={product.name} text={product.description ?? undefined} />
          </div>
        </div>
      </div>

      <ProductReviews
        productId={product.id}
        slug={product.slug}
        summary={reviewSummary}
        currentUserId={user?.id ?? null}
      />

      {relatedProducts.length > 0 && (
        <section className="flex flex-col gap-4 border-t border-zinc-200 pt-8">
          <h2 className="text-lg font-semibold">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
