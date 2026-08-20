-- Email subscribers + "coming soon" carousel slides.

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.coming_soon_items (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  caption text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('coming-soon-images', 'coming-soon-images', true)
on conflict (id) do nothing;
