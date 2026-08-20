-- Orders + order line items. Rows are written server-side (service role) once
-- Stripe confirms payment via webhook; status then tracks fulfillment only.

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'shipped', 'delivered', 'canceled', 'refunded')),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  currency text not null default 'usd',
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  total numeric(10, 2) not null check (total >= 0),
  contact_email text not null,
  shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);
