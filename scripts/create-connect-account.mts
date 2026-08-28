// Creates a new Stripe Connect v2 Account (dashboard: "express", recipient configuration) for the
// client's 90% payout split, and generates a Stripe-hosted onboarding link for them to complete.
//
// Usage: npm run connect:create-account -- client@example.com
// Requires STRIPE_SECRET_KEY in the environment (test mode key first — see PLAN.md Phase 14).
//
// This platform can't OAuth-link the client's existing independent Stripe account (Accounts v2
// platforms don't support it), and the platform's Connect setup is locked to Express Dashboard
// only (dashboard: "full" is rejected by the API), so this creates a brand-new connected account
// with Express Dashboard access for them to onboard into instead. After they complete onboarding,
// set STRIPE_CONNECTED_ACCOUNT_ID to the printed account id in .env.local + Vercel.

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY in the environment.");
}

const clientEmail = process.argv[2];
if (!clientEmail) {
  throw new Error("Usage: npm run connect:create-account -- client@example.com");
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
const stripe = new Stripe(STRIPE_SECRET_KEY);

async function main() {
  const account = await stripe.v2.core.accounts.create({
    contact_email: clientEmail,
    dashboard: "express",
    identity: { country: "CA" },
    defaults: {
      currency: "cad",
      // Destination charges without on_behalf_of: platform stays merchant of record.
      responsibilities: { fees_collector: "application", losses_collector: "application" },
    },
    configuration: {
      merchant: {
        capabilities: { card_payments: { requested: true } },
      },
      recipient: {
        capabilities: { stripe_balance: { stripe_transfers: { requested: true } } },
      },
    },
  });

  const accountLink = await stripe.v2.core.accountLinks.create({
    account: account.id,
    use_case: {
      type: "account_onboarding",
      account_onboarding: {
        configurations: ["merchant", "recipient"],
        refresh_url: `${siteUrl}/admin`,
        return_url: `${siteUrl}/admin`,
      },
    },
  });

  console.log(`Created account: ${account.id}`);
  console.log(`Onboarding link (single-use, expires soon): ${accountLink.url}`);
  console.log(
    `\nSend the onboarding link to ${clientEmail}. Once they complete it, set STRIPE_CONNECTED_ACCOUNT_ID=${account.id} in .env.local + Vercel.`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
