import Stripe from "stripe";

// Server-only Stripe client for the platform account (Checkout, webhooks, Connect transfers).
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
