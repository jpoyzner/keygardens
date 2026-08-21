-- Denormalize the reviewer's display name onto product_reviews at submission time.
-- Reviews are publicly readable, but profiles RLS restricts reads to the owner/admin,
-- so an embedded join to profiles can't resolve another user's name for display.

alter table public.product_reviews
  add column reviewer_name text not null default 'Customer';

alter table public.product_reviews
  alter column reviewer_name drop default;
