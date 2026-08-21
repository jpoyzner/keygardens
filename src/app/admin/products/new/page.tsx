import Link from "next/link";
import { getCategories } from "@/lib/catalog";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Admin — New product" };

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New product</h1>
        <Link href="/admin/products" className="text-sm underline">
          Back to products
        </Link>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
