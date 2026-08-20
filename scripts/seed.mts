// Seeds categories/products/product images/coming-soon slides from
// content-inventory/inventory.json into Supabase (DB rows + Storage uploads).
//
// Usage: npm run db:seed
// Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in the environment,
// and the migrations in supabase/migrations/ already applied to the target project.

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.",
  );
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ROOT = path.resolve(import.meta.dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content-inventory");
const INVENTORY_PATH = path.join(CONTENT_DIR, "inventory.json");

const PRODUCT_IMAGES_BUCKET = "product-images";
const COMING_SOON_BUCKET = "coming-soon-images";

interface InventoryImage {
  file: string;
}

interface InventoryProduct {
  slug: string;
  name: string;
  categorySlug: string;
  description: string | null;
  currency: string;
  price: number;
  salePrice: number | null;
  freeShipping: boolean;
  images: InventoryImage[];
}

interface InventoryCategory {
  slug: string;
  name: string;
}

interface InventorySlide {
  order: number;
  file: string;
  note?: string;
}

interface Inventory {
  categories: InventoryCategory[];
  products: InventoryProduct[];
  comingSoonSlides: InventorySlide[];
}

function contentTypeFor(file: string): string {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}

async function uploadImage(bucket: string, relativeFile: string, storagePath: string) {
  const bytes = await readFile(path.join(CONTENT_DIR, relativeFile));
  const { error } = await supabase.storage.from(bucket).upload(storagePath, bytes, {
    contentType: contentTypeFor(relativeFile),
    upsert: true,
  });
  if (error) throw new Error(`Failed to upload ${storagePath}: ${error.message}`);
}

async function seedCategories(categories: InventoryCategory[]) {
  const { data, error } = await supabase
    .from("categories")
    .upsert(
      categories.map((category, index) => ({
        slug: category.slug,
        name: category.name,
        sort_order: index,
      })),
      { onConflict: "slug" },
    )
    .select("id, slug");
  if (error) throw new Error(`Failed to seed categories: ${error.message}`);
  return new Map((data ?? []).map((row) => [row.slug as string, row.id as string]));
}

async function seedProducts(products: InventoryProduct[], categoryIdBySlug: Map<string, string>) {
  const rows = products.map((product) => {
    const categoryId = categoryIdBySlug.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(
        `Unknown category slug "${product.categorySlug}" for product "${product.slug}"`,
      );
    }
    return {
      slug: product.slug,
      name: product.name,
      description: product.description,
      category_id: categoryId,
      currency: product.currency.toLowerCase(),
      price: product.price,
      sale_price: product.salePrice,
      free_shipping: product.freeShipping,
    };
  });
  const { data, error } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "slug" })
    .select("id, slug");
  if (error) throw new Error(`Failed to seed products: ${error.message}`);
  return new Map((data ?? []).map((row) => [row.slug as string, row.id as string]));
}

async function seedProductImages(
  products: InventoryProduct[],
  productIdBySlug: Map<string, string>,
) {
  for (const product of products) {
    const productId = productIdBySlug.get(product.slug);
    if (!productId) continue;

    for (const [index, image] of product.images.entries()) {
      const filename = path.basename(image.file);
      const storagePath = `${product.slug}/${filename}`;
      await uploadImage(PRODUCT_IMAGES_BUCKET, image.file, storagePath);

      const { error } = await supabase.from("product_images").upsert(
        {
          product_id: productId,
          storage_path: storagePath,
          alt_text: product.name,
          sort_order: index,
        },
        { onConflict: "product_id,storage_path" },
      );
      if (error) {
        throw new Error(`Failed to seed product_images for ${product.slug}: ${error.message}`);
      }
    }
  }
}

async function seedComingSoonSlides(slides: InventorySlide[]) {
  for (const slide of slides) {
    const filename = path.basename(slide.file);
    const storagePath = `slide-${slide.order}-${filename}`;
    await uploadImage(COMING_SOON_BUCKET, slide.file, storagePath);

    const { error } = await supabase.from("coming_soon_items").upsert(
      {
        storage_path: storagePath,
        sort_order: slide.order,
        caption: slide.note ?? null,
      },
      { onConflict: "storage_path" },
    );
    if (error) {
      throw new Error(`Failed to seed coming_soon_items for ${storagePath}: ${error.message}`);
    }
  }
}

async function main() {
  const inventory: Inventory = JSON.parse(await readFile(INVENTORY_PATH, "utf-8"));

  console.log(`Seeding ${inventory.categories.length} categories...`);
  const categoryIdBySlug = await seedCategories(inventory.categories);

  console.log(`Seeding ${inventory.products.length} products...`);
  const productIdBySlug = await seedProducts(inventory.products, categoryIdBySlug);

  console.log("Uploading product images...");
  await seedProductImages(inventory.products, productIdBySlug);

  console.log(`Seeding ${inventory.comingSoonSlides.length} coming-soon slides...`);
  await seedComingSoonSlides(inventory.comingSoonSlides);

  console.log("Seed complete.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
