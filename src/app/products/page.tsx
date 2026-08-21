import { getCategories, getProducts, isSortOption, DEFAULT_SORT } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";

export const metadata = {
  title: "All Products — Keygardens",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const { category, sort } = await searchParams;
  const activeSort = isSortOption(sort) ? sort : DEFAULT_SORT;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: category, sort: activeSort }),
  ]);

  const activeCategoryName = category
    ? (categories.find((c) => c.slug === category)?.name ?? category)
    : null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold capitalize">
          {activeCategoryName ?? "All Products"}
        </h1>
        <p className="text-sm text-zinc-600">
          {products.length} {products.length === 1 ? "product" : "products"}
        </p>
      </div>

      <ProductFilters
        categories={categories}
        activeCategory={category ?? ""}
        activeSort={activeSort}
      />

      {products.length === 0 ? (
        <p className="py-12 text-center text-zinc-500">No products found.</p>
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
