import Link from "next/link";
import { getCategories, getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export default async function Home() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ sort: "newest" }),
  ]);
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="flex flex-1 flex-col">
      {(categories.length > 0 || featuredProducts.length > 0) && (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 rounded-lg border border-white bg-black my-6 px-4 py-6">
          {categories.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Shop by category</h2>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/products?category=${category.slug}`}
                    className="rounded-full border border-zinc-600 px-4 py-2 text-sm capitalize hover:border-zinc-400"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {featuredProducts.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">New arrivals</h2>
                <Link href="/products" className="text-sm underline">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
