-- Catalog: categories, products, product images (files live in Supabase Storage).

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  slug text not null unique,
  name text not null,
  description text,
  currency text not null default 'usd',
  price numeric(10, 2) not null check (price >= 0),
  sale_price numeric(10, 2) check (sale_price is null or sale_price < price),
  free_shipping boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, storage_path)
);

create index product_images_product_id_idx on public.product_images (product_id);

-- Public buckets: images are served directly by URL, writes are admin-only (see RLS migration).
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
