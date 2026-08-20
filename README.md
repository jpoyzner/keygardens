# Keygardens

## Proposed Requirements

Rebuild the current site at keygardens.ca using the most modern technologies. After it is built locally we will host it (see Questions section below), some domain (e.g. keygrdens.ca) will have to be pointed to the site for users to access it (that part won't be done by us). We will reuse the images & products available already. We will remove the GoDaddy advertisement on the top bar.

The rebuilt pages will include the following features:
- Search
- Shopping Cart (with real checkout)
- Contact/Feedback
- Account creation & Sign-in
- Profile/Orders screen
- Email subscription sign-up
- full SPA URL-syncing for better bookmarking
- Products pages with previews & navigation (both all products and sub-categories)
- Sorting for product pages (popularity, newness, price, alphabetical)
- Product detail pages with zooming, and add-to-cart funcitonality (and social media sharing)
- Admin-only pages to manage products (add, modify, remove, etc...)
- "Coming soon" slide show page (also editable through admin screens)
- You can suggest other features, but I need to pre-approve before you implement them

## Personal payout

- 10% of profit of all sales need to go to my own separate payment system (paypal?), but the user should not be aware of this. Perhaps two actual transations need to happen behind the scenes? I'm not sure.

## Items outside of this development

- $200 development fee (done)
- domain, pointed to site (we won't do this)
- If we can't scrape them from the site directly, someone will need to create static resources like images
- payment account available for integrating to checkout (e.g. paypal). However, I might still need information on the best way to do this.

## Questions to resolve & other concerns

- Can this be deployed on GitHub pages and have the domain point to that?
- Make sure pointing a domain to the site will not disrupt URL updates as person uses the site.
- If github pages can't access db, then maybe a static file can be used? But then would it be able to update it through the admin pages of the site? See if AI has a better suggestion for this.
- Can test everything locally first, but see notes above for access once deployed, so it does not change too radically for real deployment

- Will need some mock payment system to test it, or is there a better way to handle this?

## Running Locally

1. Install dependencies: `npm install` (requires Node 24+).
2. Copy `.env.example` to `.env.local` and fill in real values (Supabase project URL/keys, Stripe test keys, Resend key). `NEXT_PUBLIC_SITE_URL` should stay `http://localhost:3001` for local dev.
3. Apply the SQL files in [supabase/migrations](supabase/migrations) to your Supabase project, in filename order, via the Supabase Dashboard SQL Editor (no Supabase CLI is linked yet).
4. Seed the database from the content inventory: `npm run db:seed`.
5. Start the dev server: `npm run dev` — the app runs at http://localhost:3001 (port 3000 is reserved for another local project on this machine).
6. Sign up for an account at `/signup`, then grant it admin access: `npm run make-admin -- your@email.com`.

Other useful scripts: `npm run lint`, `npm run format` (Prettier), `npm run build` / `npm run start` (production build, also on port 3001).

## Deploying to Production (Vercel)

This repo is connected to Vercel with auto-deploy on push to `main` — pushing/merging to `main` on GitHub (`https://github.com/jpoyzner/keygardens`) triggers a production deploy automatically, no manual `vercel` CLI steps needed.

1. Push your changes to `main` (directly, or merge a PR into it): `git push origin main`.
2. Vercel picks up the push, runs `npm run build`, and deploys automatically — check the deployment status/logs on the Vercel dashboard for this project.
3. Make sure every variable in `.env.example` is also set as an Environment Variable on the Vercel project (Settings > Environment Variables), using **live** Stripe/Resend keys for production and the production Supabase project's keys. `NEXT_PUBLIC_SITE_URL` should be the production URL (e.g. `https://keygardens.ca` once the domain is live).
4. Any new/changed SQL files in `supabase/migrations` must be applied to the production Supabase project's SQL Editor as well — Vercel does not run them automatically.
