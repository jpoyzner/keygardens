import { searchProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export const metadata = {
  title: "Search — Keygardens",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q ?? "";
  const products = query ? await searchProducts(query) : [];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 rounded-lg border border-white bg-black my-6 px-4 py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">
          {query ? `Search results for "${query}"` : "Search"}
        </h1>
        {query && (
          <p className="text-sm text-zinc-200">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        )}
      </div>

      {!query ? (
        <p className="py-12 text-center text-zinc-300">Enter a search term above.</p>
      ) : products.length === 0 ? (
        <p className="py-12 text-center text-zinc-300">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
