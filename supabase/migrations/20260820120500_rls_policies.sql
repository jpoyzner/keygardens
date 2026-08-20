-- Row Level Security: public read on catalog/reviews, owner-only read/write on
-- personal data (orders/profiles/wishlist), admin-only write on catalog/coming-soon/order status.

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.subscribers enable row level security;
alter table public.coming_soon_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.product_reviews enable row level security;

-- profiles: users manage their own row; admins can view all. Inserts happen via
-- the handle_new_user trigger (security definer), so no insert policy is needed.
create policy "Profiles are viewable by owner or admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- categories: public read, admin write
create policy "Categories are viewable by everyone"
  on public.categories for select
  using (true);

create policy "Categories are writable by admin"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- products: public read of active products (admins also see inactive/draft rows)
create policy "Active products are viewable by everyone"
  on public.products for select
  using (is_active or public.is_admin());

create policy "Products are writable by admin"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- product_images: public read, admin write
create policy "Product images are viewable by everyone"
  on public.product_images for select
  using (true);

create policy "Product images are writable by admin"
  on public.product_images for all
  using (public.is_admin())
  with check (public.is_admin());

-- orders: owner (or admin) can read; only admins can update (status changes).
-- Inserts/deletes are performed by the service role (webhook), which bypasses RLS.
create policy "Orders are viewable by owner or admin"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Orders are updatable by admin"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

-- order_items: viewable by the owning order's user or an admin
create policy "Order items are viewable by order owner or admin"
  on public.order_items for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- subscribers: anyone can subscribe; only admins can read the list
create policy "Anyone can subscribe"
  on public.subscribers for insert
  with check (true);

create policy "Subscribers are viewable by admin"
  on public.subscribers for select
  using (public.is_admin());

-- coming_soon_items: public read of active slides, admin write
create policy "Active coming-soon slides are viewable by everyone"
  on public.coming_soon_items for select
  using (is_active or public.is_admin());

create policy "Coming-soon slides are writable by admin"
  on public.coming_soon_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- wishlist_items: fully owner-scoped
create policy "Wishlist items are viewable by owner"
  on public.wishlist_items for select
  using (auth.uid() = user_id);

create policy "Wishlist items are insertable by owner"
  on public.wishlist_items for insert
  with check (auth.uid() = user_id);

create policy "Wishlist items are deletable by owner"
  on public.wishlist_items for delete
  using (auth.uid() = user_id);

-- product_reviews: public read, owner can write their own, admin can moderate (delete)
create policy "Reviews are viewable by everyone"
  on public.product_reviews for select
  using (true);

create policy "Reviews are insertable by owner"
  on public.product_reviews for insert
  with check (auth.uid() = user_id);

create policy "Reviews are updatable by owner"
  on public.product_reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Reviews are deletable by owner or admin"
  on public.product_reviews for delete
  using (auth.uid() = user_id or public.is_admin());

-- Storage: product/coming-soon images are public to read, admin-only to write.
create policy "Product images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Product images are writable by admin"
  on storage.objects for all
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Coming-soon images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'coming-soon-images');

create policy "Coming-soon images are writable by admin"
  on storage.objects for all
  using (bucket_id = 'coming-soon-images' and public.is_admin())
  with check (bucket_id = 'coming-soon-images' and public.is_admin());
