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

## Phase 2 — Data Model & Schema
- [ ] Design tables: `categories`, `products`, `product_images`, `orders` (including a `status` field for pending/shipped/delivered), `order_items`, `profiles` (extends Supabase auth users, includes `is_admin` flag), `subscribers`, `coming_soon_items`, `wishlist_items`, `product_reviews`
- [ ] Add Postgres Row Level Security policies (public read on products/categories/reviews, owner-only read/write on orders/profiles/wishlist, admin-only write on products/coming-soon/order status)
- [ ] Seed database from the Phase 0 content inventory (products, categories, images uploaded to Supabase Storage)

## Phase 3 — Auth & Accounts
- [ ] Sign-up / sign-in pages (Supabase Auth, email/password + password reset flow)
- [ ] Session handling via Next.js middleware, protected routes for account/admin pages
- [ ] Mark your account as `is_admin` for access to admin pages

## Phase 4 — Core Storefront Browsing
- [ ] Home page
- [ ] All-products page and per-category/sub-category pages, with URL-synced filters (e.g. `/products?category=x&sort=price`)
- [ ] Sorting: popularity, newness, price, alphabetical
- [ ] Product preview cards (image, name, price, quick link)

## Phase 5 — Product Detail Page
- [ ] Product detail route with image zoom (e.g. hover/click-to-zoom gallery)
- [ ] Add-to-cart action
- [ ] Social sharing button (Web Share API) + Open Graph tags for rich link previews
- [ ] Product reviews/ratings: signed-in users can leave a star rating + written review, shown on the product page with an average rating
- [ ] "You may also like" related products section (same category, excluding the current product)

## Phase 6 — Search
- [ ] Search bar in header, results page with URL-synced query param
- [ ] v1: filter across cached product list (name/category/description) — revisit a dedicated search service later if catalog grows significantly

## Phase 7 — Cart & Checkout
- [ ] Cart state (persisted per session/user), add/remove/update quantity
- [ ] Stripe Checkout session creation (server-side API route)
- [ ] Stripe Connect destination charge: automatically routes 10% of profit to your connected account on every successful payment
- [ ] Order + order_items written to DB on successful webhook confirmation
- [ ] Test entirely in Stripe test mode before go-live

## Phase 8 — Profile & Orders
- [ ] Profile page (view/edit account details)
- [ ] Order history list + order detail view (including current status: pending/shipped/delivered)
- [ ] Wishlist/favorites: signed-in users can save products to a personal wishlist and view/remove them from their profile

## Phase 9 — Contact/Feedback & Email Subscription
- [ ] Contact/feedback form → sends via Resend to your inbox, stores submission in DB
- [ ] Email subscription sign-up form → stores in `subscribers` table, sends confirmation via Resend
- [ ] Order status emails: automatic email via Resend when an order's status changes to shipped or delivered (beyond the initial purchase receipt)

## Phase 10 — Admin: Product Management
- [ ] Admin-only dashboard (gated by `is_admin`)
- [ ] Create/edit/remove products and categories, manage images (upload to Supabase Storage)
- [ ] Update order status (pending/shipped/delivered), triggering the status emails from Phase 9
- [ ] Moderate/remove product reviews if needed

## Phase 11 — "Coming Soon" Page
- [ ] Standalone `/coming-soon` page with slideshow
- [ ] Admin screen to add/edit/reorder/remove slides

## Phase 12 — Migration Details
- [ ] Confirm no GoDaddy ad banner exists in the rebuild (not applicable — rebuilt from scratch, not on GoDaddy hosting)

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
