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
      <section className="flex flex-col items-center gap-4 border-b border-zinc-200 px-4 py-20 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Keygardens</h1>
        <p className="max-w-md text-zinc-600">
          Browse our full catalog of hoodies, hats, and tees.
        </p>
        <Link
          href="/products"
          className="rounded bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
        >
          Shop all products
        </Link>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-12">
          <h2 className="text-lg font-semibold">Shop by category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm capitalize hover:border-zinc-500"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-12">
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
        </section>
      )}
    </div>
  );
}
