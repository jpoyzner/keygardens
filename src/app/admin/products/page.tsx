import Link from "next/link";
import { getAdminProducts } from "@/lib/admin/products";

export const metadata = { title: "Admin — Products" };

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded bg-white px-4 py-2 text-sm font-medium text-zinc-900"
        >
          New product
        </Link>
      </div>

      <ul className="flex flex-col gap-2">
        {products.map((product) => (
          <li key={product.id}>
            <Link
              href={`/admin/products/${product.id}`}
              className="flex items-center justify-between rounded border border-zinc-700 px-4 py-3 hover:border-zinc-500"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{product.name}</span>
                <span className="text-xs text-zinc-300">
                  {product.categoryName ?? "Uncategorized"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">{formatPrice(product.price, product.currency)}</span>
                {!product.isActive && (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                    Draft
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
        {products.length === 0 && <p className="text-sm text-zinc-200">No products yet.</p>}
      </ul>
    </div>
  );
}
