"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/catalog";

export interface ProductActionState {
  error?: string;
}

function parseProductFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const price = Number(formData.get("price"));
  const salePriceRaw = String(formData.get("salePrice") ?? "").trim();
  const currency = String(formData.get("currency") ?? "usd").trim() || "usd";

  return {
    name,
    slug: slugInput ? slugify(slugInput) : slugify(name),
    description: description || null,
    categoryId: categoryId || null,
    price,
    salePrice: salePriceRaw ? Number(salePriceRaw) : null,
    currency: currency.toLowerCase(),
    freeShipping: formData.get("freeShipping") === "on",
    isActive: formData.get("isActive") === "on",
  };
}

export async function createProduct(
  _state: ProductActionState | undefined,
  formData: FormData,
): Promise<ProductActionState> {
  const fields = parseProductFields(formData);
  if (!fields.name || !Number.isFinite(fields.price)) {
    return { error: "Enter a name and a valid price." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: fields.name,
      slug: fields.slug,
      description: fields.description,
      category_id: fields.categoryId,
      price: fields.price,
      sale_price: fields.salePrice,
      currency: fields.currency,
      free_shipping: fields.freeShipping,
      is_active: fields.isActive,
    })
    .select("id")
    .single();
  if (error) {
    return { error: `Could not create product: ${error.message}` };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect(`/admin/products/${data.id}`);
}

export async function updateProduct(
  id: string,
  _state: ProductActionState | undefined,
  formData: FormData,
): Promise<ProductActionState> {
  const fields = parseProductFields(formData);
  if (!fields.name || !Number.isFinite(fields.price)) {
    return { error: "Enter a name and a valid price." };
  }

  const supabase = await createClient();
  const { data: current } = await supabase.from("products").select("slug").eq("id", id).single();

  const { error } = await supabase
    .from("products")
    .update({
      name: fields.name,
      slug: fields.slug,
      description: fields.description,
      category_id: fields.categoryId,
      price: fields.price,
      sale_price: fields.salePrice,
      currency: fields.currency,
      free_shipping: fields.freeShipping,
      is_active: fields.isActive,
    })
    .eq("id", id);
  if (error) {
    return { error: `Could not update product: ${error.message}` };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/products");
  if (current?.slug) revalidatePath(`/products/${current.slug}`);
  if (fields.slug !== current?.slug) revalidatePath(`/products/${fields.slug}`);
  return {};
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("slug, product_images(storage_path)")
    .eq("id", id)
    .single();

  if (product) {
    const paths = product.product_images.map((image) => image.storage_path);
    if (paths.length > 0) {
      await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
    }
  }

  await supabase.from("products").delete().eq("id", id);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function addProductImage(
  productId: string,
  productSlug: string,
  _state: ProductActionState | undefined,
  formData: FormData,
): Promise<ProductActionState> {
  const file = formData.get("file");
  const altText = String(formData.get("altText") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file to upload." };
  }

  const supabase = await createClient();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const storagePath = `${productSlug}/${randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(storagePath, file, { contentType: file.type || "application/octet-stream" });
  if (uploadError) {
    return { error: `Could not upload image: ${uploadError.message}` };
  }

  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: storagePath,
    alt_text: altText || null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  });
  if (error) {
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([storagePath]);
    return { error: `Could not save image: ${error.message}` };
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/products/${productSlug}`);
  return {};
}

export async function deleteProductImage(imageId: string, productId: string, productSlug: string) {
  const supabase = await createClient();
  const { data: image } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("id", imageId)
    .single();

  await supabase.from("product_images").delete().eq("id", imageId);
  if (image?.storage_path) {
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([image.storage_path]);
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/products/${productSlug}`);
}
