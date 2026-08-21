import { getCategories } from "@/lib/catalog";
import { deleteCategory } from "@/lib/admin/categories-actions";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata = { title: "Admin — Categories" };

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Categories</h1>

      <ul className="flex flex-col gap-3">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex flex-wrap items-end justify-between gap-2 rounded border border-zinc-700 px-4 py-3"
          >
            <CategoryForm category={category} />
            <form action={deleteCategory.bind(null, category.id)}>
              <button type="submit" className="text-sm text-red-600 underline">
                Delete
              </button>
            </form>
          </li>
        ))}
        {categories.length === 0 && <p className="text-sm text-zinc-200">No categories yet.</p>}
      </ul>

      <div className="rounded border border-dashed border-zinc-600 px-4 py-3">
        <h2 className="mb-2 text-sm font-medium">Add a category</h2>
        <CategoryForm />
      </div>
    </div>
  );
}
