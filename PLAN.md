# Keygardens Rebuild — Implementation Plan

This plan implements the requirements in [README.md](README.md), based on the technical/design decisions gathered below.

## Decisions Log (from interview)

| Area | Decision |
|---|---|
| Framework | Next.js (App Router, TypeScript) — one codebase for pages + API routes, gives SPA-style URL-syncing for free |
| Hosting | Vercel (not GitHub Pages) — supports API routes, serverless functions, cron jobs, image optimization |
| Database | Supabase (managed Postgres) |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage for product images |
| Payments | Stripe (checkout), **Stripe Connect (destination charges)** for the automatic 10% split |
| Payout recipient | You will complete Stripe Connect onboarding (individual account + bank details) to receive the automatic 10% payouts |
| Search (v1) | Simple client/server-side filter over name, category, description — no dedicated search service |
| Email | Resend, for subscription confirmations + transactional email (order receipts, contact form replies) |
| Admin | Single admin account (flag on your user record), no multi-role system for v1 |
| "Coming soon" | Standalone page (own route/nav item), slides managed from an admin screen |
| Social sharing | Web Share API (native share sheet) + Open Graph meta tags on product pages |
| Environments | Local dev + one production deploy — no separate staging environment |
| Content sourcing | Public scrape of the live keygardens.ca (no admin/FTP access available) |
| Repo | This repository (keygardens) is used for the entire project — app code, config, and this plan |
| Domain cutover | We handle everything possible on our end (Vercel custom domain config, SSL, apex/www setup); you only need to update the DNS records at your registrar to point keygardens.ca at Vercel |

## Risks / Things to Keep an Eye On

- **Stripe Connect KYC**: your payout account can't go live until Stripe verifies identity/bank details — start this early (Phase 1), it can take days.
- **"User should not be aware of the split"**: with Stripe destination charges, the customer only ever sees one charge and one checkout — the split happens server-side automatically. Nothing extra needed to hide it.
- **Scraped content quality**: public scraping only gets what's rendered on the live pages (visible images/text). Missing alt text, hi-res images, or hidden variants will need manual follow-up with you.
- **Domain cutover**: we'll pre-configure the domain in Vercel and hand you the exact DNS records to add — the actual record change at your registrar is the one step only you can do.

---

## Phase 0 — Discovery & Content Inventory
- [x] Crawl keygardens.ca and record: full category/sub-category tree, product list (name, description, price, category, image URLs) — see [content-inventory/inventory.json](content-inventory/inventory.json)
- [x] Download product + site images at best available resolution — see `content-inventory/images/`
- [x] Note any content that looks incomplete/low-res and flag for you to supply manually — see [content-inventory/NOTES.md](content-inventory/NOTES.md)
- [x] Produce a structured inventory file (JSON/CSV) used to seed the database in Phase 2 — [content-inventory/inventory.json](content-inventory/inventory.json)

## Phase 1 — Project Foundation & Infra
- [x] Init Next.js (TypeScript) app in this repository, ESLint/Prettier, Tailwind CSS
- [x] Connect this repo to Vercel (auto-deploy on push to `main`)
- [x] Create Supabase project (Postgres + Auth + Storage), wire up env vars locally and in Vercel
- [x] Create Stripe account, enable test mode, **start Stripe Connect onboarding for your payout account** (this can run in parallel while dev continues)
- [ ] Create Resend account + verify sending domain — **requires you**: sign up for Resend and verify the sending domain
  - Blocked: Resend's "auto configure" needs sign-in to the DNS provider for `keygardens.ca`, which we don't have (client owns the domain). Using manual setup instead: Resend gives us the DNS records to hand to the client to add at their registrar. Until verified, use Resend's shared sandbox sender (`onboarding@resend.dev`) for local dev/testing.
  - Supabase Auth's custom SMTP (Project Settings > Authentication > SMTP Settings) is configured to relay through Resend (`smtp.resend.com`, sender `onboarding@resend.dev`) so auth emails (confirmation, password reset) actually deliver — Supabase's built-in mailer only sends to project team members otherwise. **Since this is the same Supabase project used by both local dev and production, this SMTP config is shared** — once the real sending domain is verified in Resend, remember to update the sender email in Supabase's SMTP settings (not just `RESEND_FROM_EMAIL` in `.env.local`/Vercel) to the branded address.

### Stripe Connect — current setup state (temporary, until the second account exists)

- Only one Stripe account exists so far. It's temporarily acting as the **platform account**: its test-mode keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) are in `.env.local`/Vercel, and it's what creates Checkout sessions and receives the 90% by default (no extra config needed for that part).
- Connect is enabled on that account, using the **"You collect payments and pay recipients"** integration type (destination charges — customer sees one charge, split happens server-side).
- A **test-mode connected account** was created under it to receive the 10% split; its ID is `STRIPE_CONNECTED_ACCOUNT_ID` in `.env.local`/Vercel.
- A webhook endpoint is configured on the platform account (scope: "Your account", not "Connected accounts"), listening for `checkout.session.completed` (+ optionally `checkout.session.async_payment_failed`, `checkout.session.expired`), pointed at the Vercel git-main branch URL + `/api/webhooks/stripe`. That route doesn't exist yet (Phase 7) — deliveries will fail/404 until then, which is expected.
- **TODO once the real second (90%-recipient) business account is created**: swap roles — the new account becomes the platform account (its keys replace the current ones in `.env.local`/Vercel), and the current account gets properly onboarded as the real (non-test) connected account to receive the live 10% payouts.

## Phase 2 — Data Model & Schema
- [x] Design tables: `categories`, `products`, `product_images`, `orders` (including a `status` field for pending/shipped/delivered), `order_items`, `profiles` (extends Supabase auth users, includes `is_admin` flag), `subscribers`, `coming_soon_items`, `wishlist_items`, `product_reviews` — see [supabase/migrations](supabase/migrations)
- [x] Add Postgres Row Level Security policies (public read on products/categories/reviews, owner-only read/write on orders/profiles/wishlist, admin-only write on products/coming-soon/order status) — see [supabase/migrations/20260820120500_rls_policies.sql](supabase/migrations/20260820120500_rls_policies.sql)
- [x] Seed database from the Phase 0 content inventory (products, categories, images uploaded to Supabase Storage) — `npm run db:seed` ([scripts/seed.mts](scripts/seed.mts)) run successfully against the Supabase project: 3 categories, 3 products with images, 4 coming-soon slides (the initially-seeded "sport hat" product/category was later removed as a duplicate of "hats")


## Phase 3 — Auth & Accounts
- [x] Sign-up / sign-in pages (Supabase Auth, email/password + password reset flow) — [src/app/login](src/app/login), [src/app/signup](src/app/signup), [src/app/forgot-password](src/app/forgot-password), [src/app/reset-password](src/app/reset-password), [src/app/auth/confirm/route.ts](src/app/auth/confirm/route.ts)
- [x] Session handling via Next.js proxy (middleware.js was renamed to proxy.js in Next.js 16), protected routes for account/admin pages — [src/proxy.ts](src/proxy.ts), [src/lib/supabase/middleware.ts](src/lib/supabase/middleware.ts), [src/app/account/layout.tsx](src/app/account/layout.tsx), [src/app/admin/layout.tsx](src/app/admin/layout.tsx)
- [x] Mark your account as `is_admin` for access to admin pages — **requires you**: sign up at `/signup`, then run `npm run make-admin -- your@email.com`. Done: `JeffPoyzner@yahoo.com` granted admin and confirmed access to `/admin`.

## Phase 4 — Core Storefront Browsing
- [x] Home page — [src/app/page.tsx](src/app/page.tsx) (a plain welcome splash with no bordered content panels; category/featured-product browsing lives on [src/app/products/page.tsx](src/app/products/page.tsx))
- [x] All-products page and per-category/sub-category pages, with URL-synced filters (e.g. `/products?category=x&sort=price`) — [src/app/products/page.tsx](src/app/products/page.tsx), [src/components/product-filters.tsx](src/components/product-filters.tsx)
- [x] Sorting: popularity, newness, price, alphabetical — see `SORT_OPTIONS` in [src/lib/catalog.ts](src/lib/catalog.ts) (popularity currently ranks by review count; revisit once order history exists in Phase 7)
- [x] Product preview cards (image, name, price, quick link) — [src/components/product-card.tsx](src/components/product-card.tsx), linking to a minimal `/products/[slug]` detail page ([src/app/products/[slug]/page.tsx](src/app/products/%5Bslug%5D/page.tsx)) that Phase 5 will flesh out (zoom, cart, reviews, related products)

## Phase 5 — Product Detail Page
- [x] Product detail route with image zoom (e.g. hover/click-to-zoom gallery) — [src/components/product-gallery.tsx](src/components/product-gallery.tsx) (hover magnifier + click-to-open lightbox, thumbnail strip for multi-image products)
- [x] Add-to-cart action — minimal localStorage-backed cart context ([src/lib/cart/cart-context.tsx](src/lib/cart/cart-context.tsx)) + [src/components/add-to-cart-button.tsx](src/components/add-to-cart-button.tsx) and a header cart count ([src/components/cart-indicator.tsx](src/components/cart-indicator.tsx)); Phase 7 will add server-side persistence and checkout on top of this
- [x] Social sharing button (Web Share API) + Open Graph tags for rich link previews — [src/components/share-button.tsx](src/components/share-button.tsx) (falls back to copy-link), `generateMetadata` in [src/app/products/[slug]/page.tsx](src/app/products/%5Bslug%5D/page.tsx)
- [x] Product reviews/ratings: signed-in users can leave a star rating + written review, shown on the product page with an average rating — [src/components/product-reviews.tsx](src/components/product-reviews.tsx), [src/components/review-form.tsx](src/components/review-form.tsx), [src/lib/reviews/actions.ts](src/lib/reviews/actions.ts); needs the new [supabase/migrations/20260821000000_product_reviews_reviewer_name.sql](supabase/migrations/20260821000000_product_reviews_reviewer_name.sql) migration applied — **requires you**: run it via the Supabase SQL Editor like the earlier migrations
- [x] "You may also like" related products section (same category, excluding the current product) — `getRelatedProducts()` in [src/lib/catalog.ts](src/lib/catalog.ts)

## Phase 6 — Search
- [x] Search bar in header, results page with URL-synced query param — [src/components/search-bar.tsx](src/components/search-bar.tsx) (GET form, header in [src/components/site-header.tsx](src/components/site-header.tsx)), [src/app/search/page.tsx](src/app/search/page.tsx) (`?q=`)
- [x] v1: filter across cached product list (name/category/description) — `searchProducts()` in [src/lib/catalog.ts](src/lib/catalog.ts); revisit a dedicated search service later if catalog grows significantly

## Phase 7 — Cart
- [x] Cart state (persisted per session/user), add/remove/update quantity — cart state itself was already built in Phase 5 ([src/lib/cart/cart-context.tsx](src/lib/cart/cart-context.tsx), localStorage-backed); this phase added the missing [src/app/cart/page.tsx](src/app/cart/page.tsx) view (line items, quantity edit, remove, subtotal) and pointed [src/components/cart-indicator.tsx](src/components/cart-indicator.tsx) at it
  - Note: all Stripe/payment work (checkout session creation, Connect destination charge, order writing) has been deferred to [Phase 12](#phase-12--checkout--payments-stripe), so this phase only covers the cart itself — the cart page has a disabled "Checkout (coming soon)" button as a placeholder.

## Phase 8 — Profile & Orders
- [x] Profile page (view/edit account details) — [src/app/account/page.tsx](src/app/account/page.tsx) now edits `profiles.full_name` via [src/components/profile-form.tsx](src/components/profile-form.tsx) + [src/lib/account/actions.ts](src/lib/account/actions.ts)
- [x] Order history list + order detail view (including current status: pending/shipped/delivered) — [src/app/account/orders/page.tsx](src/app/account/orders/page.tsx), [src/app/account/orders/[id]/page.tsx](src/app/account/orders/%5Bid%5D/page.tsx), data access in [src/lib/orders.ts](src/lib/orders.ts); UI is built against the existing `orders`/`order_items` schema and will show empty until [Phase 12](#phase-12--checkout--payments-stripe) actually creates orders
- [x] Wishlist/favorites: signed-in users can save products to a personal wishlist and view/remove them from their profile — [src/components/wishlist-button.tsx](src/components/wishlist-button.tsx) (product detail page) + [src/app/account/wishlist/page.tsx](src/app/account/wishlist/page.tsx), mutations in [src/lib/wishlist/actions.ts](src/lib/wishlist/actions.ts), reads (`getWishlistProducts`/`isProductWishlisted`) added to [src/lib/catalog.ts](src/lib/catalog.ts)

## Phase 9 — Contact/Feedback & Email Subscription
- [x] Contact/feedback form → sends via Resend to your inbox, stores submission in DB — [src/app/contact/page.tsx](src/app/contact/page.tsx), [src/components/contact-form.tsx](src/components/contact-form.tsx), [src/lib/contact/actions.ts](src/lib/contact/actions.ts), stored in [supabase/migrations/20260822000000_contact_submissions.sql](supabase/migrations/20260822000000_contact_submissions.sql) — **requires you**: apply the new migration, and set `CONTACT_INBOX_EMAIL` in `.env.local`/Vercel to the inbox that should receive submissions
- [x] Email subscription sign-up form → stores in `subscribers` table, sends confirmation via Resend — [src/components/subscribe-form.tsx](src/components/subscribe-form.tsx), [src/lib/subscribers/actions.ts](src/lib/subscribers/actions.ts), shown on [src/app/coming-soon/page.tsx](src/app/coming-soon/page.tsx)
- [x] Order status emails: automatic email via Resend when an order's status changes to shipped or delivered (beyond the initial purchase receipt) — triggered from [src/lib/admin/orders-actions.ts](src/lib/admin/orders-actions.ts) via `sendOrderStatusEmail` in [src/lib/email.ts](src/lib/email.ts)

## Phase 10 — Admin: Product Management
- [x] Admin-only dashboard (gated by `is_admin`) — [src/app/admin/page.tsx](src/app/admin/page.tsx), nav in [src/app/admin/layout.tsx](src/app/admin/layout.tsx)
- [x] Create/edit/remove products and categories, manage images (upload to Supabase Storage) — [src/app/admin/products](src/app/admin/products), [src/app/admin/categories/page.tsx](src/app/admin/categories/page.tsx), [src/lib/admin/products.ts](src/lib/admin/products.ts), [src/lib/admin/products-actions.ts](src/lib/admin/products-actions.ts), [src/lib/admin/categories-actions.ts](src/lib/admin/categories-actions.ts)
- [x] Update order status (pending/shipped/delivered), triggering the status emails from Phase 9 — [src/app/admin/orders](src/app/admin/orders), [src/lib/admin/orders-actions.ts](src/lib/admin/orders-actions.ts)
- [x] Moderate/remove product reviews if needed — [src/app/admin/reviews/page.tsx](src/app/admin/reviews/page.tsx), [src/lib/admin/reviews.ts](src/lib/admin/reviews.ts), [src/lib/admin/reviews-actions.ts](src/lib/admin/reviews-actions.ts)

## Phase 11 — "Coming Soon" Page
- [x] Standalone `/coming-soon` page with slideshow — [src/app/coming-soon/page.tsx](src/app/coming-soon/page.tsx), [src/components/coming-soon-slideshow.tsx](src/components/coming-soon-slideshow.tsx), reads in [src/lib/coming-soon.ts](src/lib/coming-soon.ts)
- [x] Admin screen to add/edit/reorder/remove slides — [src/app/admin/coming-soon/page.tsx](src/app/admin/coming-soon/page.tsx), [src/lib/admin/coming-soon.ts](src/lib/admin/coming-soon.ts), [src/lib/admin/coming-soon-actions.ts](src/lib/admin/coming-soon-actions.ts)

## Phase 12 — Checkout & Payments (Stripe)
- [ ] Stripe Checkout session creation (server-side API route)
- [ ] Stripe Connect destination charge: automatically routes 10% of profit to your connected account on every successful payment
- [ ] Order + order_items written to DB on successful webhook confirmation
- [ ] Test entirely in Stripe test mode before go-live

## Phase 13 — Testing
- [ ] Unit tests for utilities/business logic (e.g. cart totals, sort/filter logic)
- [ ] End-to-end tests (Playwright) for: browse → add to cart → checkout (Stripe test mode) → order appears in profile
- [ ] Manual test pass of admin CRUD and coming-soon editing

## Phase 14 — Launch Prep
- [ ] Switch Stripe to live mode once Connect account is verified
- [ ] Final content review against the live site (Phase 0 inventory)
- [ ] Add keygardens.ca as a custom domain on the Vercel project, configure apex + `www` redirect, and confirm SSL is issued
- [ ] Send you the exact DNS records to add at your registrar so keygardens.ca points at the Vercel deployment
- [ ] Post-launch smoke test on the real domain once DNS has propagated
