"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";

export interface CategoryActionState {
  error?: string;
}

export async function createCategory(
  _state: CategoryActionState | undefined,
  formData: FormData,
): Promise<CategoryActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!name) {
    return { error: "Enter a category name." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    name,
    slug: slugInput ? slugify(slugInput) : slugify(name),
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  });
  if (error) {
    return { error: `Could not create category: ${error.message}` };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  return {};
}

export async function updateCategory(
  id: string,
  _state: CategoryActionState | undefined,
  formData: FormData,
): Promise<CategoryActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!name || !slugInput) {
    return { error: "Name and slug are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name,
      slug: slugify(slugInput),
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    })
    .eq("id", id);
  if (error) {
    return { error: `Could not update category: ${error.message}` };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  return {};
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", id);

  revalidatePath("/admin/categories");
  revalidatePath("/products");
}
