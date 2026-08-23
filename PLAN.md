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
- A separate test-mode "Keygardens" Stripe account (`acct_1U6dbuANY9300s2U`) was also created (by you, under your own credentials), but it is **not** currently wired into `STRIPE_CONNECTED_ACCOUNT_ID` and isn't referenced anywhere in the codebase — it was created to explore the split before deciding on the real handoff plan below.
- **Decided 2026-08-23**: the client will create their own Stripe account (their own business/tax/bank details) rather than us handing off an account created under Poyzner Technologies credentials — Stripe has no real "transfer ownership" feature; changing the legal entity/tax ID/payout bank on an existing account is a bigger operation than a simple handoff and creates tax-reporting mismatches in the meantime. Poyzner Technologies stays the platform account (keys, webhook, `orders` writes) — no swap of which account is "platform" is required, since `transfer_data` can send any percentage to the connected account regardless of size.
- The actual ordered steps to switch to the 90% (client) / 10% (Poyzner Technologies) split, and to delete the leftover `acct_1U6dbuANY9300s2U` placeholder, are tracked under [Phase 14](#phase-14--launch-prep) (bundled with going live, since both involve switching Stripe to live mode).

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
  - Note: all Stripe/payment work (checkout session creation, Connect destination charge, order writing) was deferred to [Phase 12](#phase-12--checkout--payments-stripe), so this phase only covered the cart itself — the cart page had a disabled "Checkout (coming soon)" button as a placeholder until Phase 12 replaced it with a real checkout flow.

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
- [x] Stripe Checkout session creation (server action, not a route — Stripe's redirect-based Checkout doesn't need a dedicated API route) — [src/lib/checkout/actions.ts](src/lib/checkout/actions.ts), wired to [src/components/checkout-button.tsx](src/components/checkout-button.tsx) on [src/app/cart/page.tsx](src/app/cart/page.tsx)
- [x] Stripe Connect destination charge: automatically routes 10% of profit to your connected account on every successful payment — `payment_intent_data.transfer_data` in [src/lib/checkout/actions.ts](src/lib/checkout/actions.ts), using `STRIPE_CONNECTED_ACCOUNT_ID`
- [x] Order + order_items written to DB on successful webhook confirmation — [src/app/api/webhooks/stripe/route.ts](src/app/api/webhooks/stripe/route.ts) (service-role client, idempotent on `stripe_checkout_session_id`), plus a receipt email via `sendOrderReceiptEmail` in [src/lib/email.ts](src/lib/email.ts) and a confirmation page at [src/app/checkout/success/page.tsx](src/app/checkout/success/page.tsx)
- [x] Test entirely in Stripe test mode before go-live — verified end-to-end 2026-08-23: full test-mode purchase (test card `4242 4242 4242 4242`) against the deployed app, webhook (`checkout.session.completed`, scoped to **Your account**, not Connected accounts) delivered automatically, order + order_items written correctly, and the 10% Connect transfer (`transfer_data.amount`) confirmed on the connected account via the Stripe event log

## Phase 13 — Testing
- [x] Unit tests for utilities/business logic (e.g. cart totals, sort/filter logic) — [vitest.config.mts](vitest.config.mts), `npm test` ([package.json](package.json)); [src/lib/slugify.test.ts](src/lib/slugify.test.ts), [src/lib/catalog.test.ts](src/lib/catalog.test.ts) (category filter, popularity sort, search matching — extracted as pure `filterProductsByCategory`/`sortByPopularity`/`matchesSearchQuery` helpers in [src/lib/catalog.ts](src/lib/catalog.ts)), [src/lib/cart/cart-context.test.ts](src/lib/cart/cart-context.test.ts) (extracted `calculateTotalQuantity`/`calculateSubtotal` in [src/lib/cart/cart-context.tsx](src/lib/cart/cart-context.tsx))
- [x] Manual test pass of admin CRUD and coming-soon editing — done 2026-08-23 via a throwaway confirmed admin account (created/granted/deleted via the existing scripts, no real credentials used) driven through the local dev server in a browser: category create/edit/delete, product create/edit/delete, orders/reviews list pages, and coming-soon slide reorder/caption-edit/deactivate-reactivate/add/delete all worked correctly; all test data was cleaned up afterward (no leftover rows/storage objects)
- [x] Manual test pass of all transactional email links/flows end-to-end — no inbox access available, so this was a code-path review instead of live delivery: confirmed `signup`'s `emailRedirectTo` and `requestPasswordReset`'s `redirectTo` in [src/lib/auth/actions.ts](src/lib/auth/actions.ts) both point at `/auth/confirm?next=...`, which [src/app/auth/confirm/route.ts](src/app/auth/confirm/route.ts) verifies via `verifyOtp` and redirects to the intended page ([src/app/account/page.tsx](src/app/account/page.tsx) / [src/app/reset-password/page.tsx](src/app/reset-password/page.tsx)) — matches the Supabase email template fix already recorded in Phase 3. Subscription/order-receipt/order-status emails ([src/lib/email.ts](src/lib/email.ts)) contain no links, so there's nothing to misroute. **Still requires you**: an actual live send-and-click test from a real inbox, since delivery itself can't be verified without one.


## Phase 14 — Launch Prep
- [ ] Final content review against the live site (Phase 0 inventory)

### Domain cutover (keygardens.ca)
- [ ] Add keygardens.ca as a custom domain on the Vercel project, configure apex + `www` redirect
- [ ] Gather the Resend sending-domain verification DNS records too (blocked item from Phase 1) so the client only has to make one trip to their registrar
- [ ] Send the client the combined DNS record list (Vercel domain + Resend verification) to add at their registrar — **requires the client**: this is the one step only they can do
- [ ] Wait for DNS propagation and confirm SSL is issued on the Vercel domain
- [ ] Once Resend's domain verification completes: update `RESEND_FROM_EMAIL` (Vercel env var) **and** the sender address in Supabase Auth's SMTP settings to the branded address — both need updating since the same Supabase project is shared by local dev and production (see Phase 1 note)
- [ ] Update `NEXT_PUBLIC_SITE_URL` in Vercel's production env vars to `https://keygardens.ca` — this feeds auth email redirect links ([src/lib/auth/actions.ts](src/lib/auth/actions.ts)) and Stripe Checkout success/cancel URLs ([src/lib/checkout/actions.ts](src/lib/checkout/actions.ts))
- [ ] Add `https://keygardens.ca` (and the `www` variant if used) to Supabase Auth > URL Configuration > Site URL + Redirect URLs allow list — Supabase rejects auth confirm/reset redirects to any URL not on this list

### Stripe: 90/10 split + live mode
- [ ] Client creates their own Stripe account (in progress as of 2026-08-23)
- [ ] You invite that account as a **Standard** connected account (Stripe Dashboard > Connect > Accounts > + Create > Standard, invite by the client's email) — the client links their existing account during this flow, which is what actually makes it usable as a `transfer_data.destination`
- [ ] Set `STRIPE_CONNECTED_ACCOUNT_ID` (test mode first, `.env.local` + Vercel) to the resulting connected account's `acct_...` ID
- [ ] Code change: bump `CONNECTED_ACCOUNT_SPLIT` from `0.1` to `0.9` in [src/lib/checkout/actions.ts](src/lib/checkout/actions.ts) (update the comment above it too)
- [ ] Re-verify end-to-end in test mode (same method as the 2026-08-23 Phase 12 test) — confirm 90% transfers to the client's connected account and 10% stays with the Poyzner Technologies platform account
- [ ] Switch both the platform account and the client's connected account to live mode: live `STRIPE_SECRET_KEY`/`STRIPE_CONNECTED_ACCOUNT_ID`/`STRIPE_WEBHOOK_SECRET`/publishable key in Vercel, and a newly-configured live-mode webhook endpoint (test/live webhooks are separate) pointed at `https://keygardens.ca/api/webhooks/stripe` once the domain cutover above is done
- [ ] Delete the unused `acct_1U6dbuANY9300s2U` "Keygardens" placeholder test account once the real connected account is confirmed working

### Final checks
- [ ] Post-launch smoke test on the real domain: browse/search, signup + password-reset email links, a full live (or test-mode, if going live gradually) checkout purchase, contact form, subscribe form, admin login
- [ ] Live-inbox check for every transactional email link/flow (the part Phase 13 couldn't verify without inbox access): click the real signup-confirmation and password-reset links end-to-end, and confirm the subscription-confirmation and order-receipt/status emails actually arrive

## Phase 15 — Nice to Have
- [ ] End-to-end tests (Playwright) for: browse → add to cart → checkout (Stripe test mode) → order appears in profile
