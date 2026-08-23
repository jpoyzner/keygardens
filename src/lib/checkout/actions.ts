"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import type { CartItem } from "@/lib/cart/cart-context";
import type Stripe from "stripe";

// Portion of every sale automatically transferred to the connected payout account (see PLAN.md Phase 12).
const CONNECTED_ACCOUNT_SPLIT = 0.1;

export interface CheckoutActionState {
  error?: string;
}

export async function createCheckoutSession(cartItems: CartItem[]): Promise<CheckoutActionState> {
  if (cartItems.length === 0) {
    return { error: "Your cart is empty." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Re-fetch authoritative prices/names from the DB — never trust client-submitted amounts for payment.
  const productIds = [...new Set(cartItems.map((item) => item.productId))];
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, sale_price, currency, is_active")
    .in("id", productIds);
  if (productsError || !products) {
    return { error: "Could not verify cart items. Please try again." };
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let totalCents = 0;
  for (const cartItem of cartItems) {
    const product = products.find((p) => p.id === cartItem.productId);
    if (!product || !product.is_active) {
      return { error: "A product in your cart is no longer available." };
    }
    const unitAmount = Math.round((product.sale_price ?? product.price) * 100);
    totalCents += unitAmount * cartItem.quantity;
    lineItems.push({
      quantity: cartItem.quantity,
      price_data: {
        currency: product.currency,
        unit_amount: unitAmount,
        product_data: {
          name: product.name,
          metadata: { product_id: product.id },
        },
      },
    });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  const connectedAccountId = process.env.STRIPE_CONNECTED_ACCOUNT_ID;

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: user?.email,
      client_reference_id: user?.id,
      shipping_address_collection: { allowed_countries: ["US", "CA"] },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart`,
      payment_intent_data: connectedAccountId
        ? {
            transfer_data: {
              destination: connectedAccountId,
              amount: Math.round(totalCents * CONNECTED_ACCOUNT_SPLIT),
            },
          }
        : undefined,
    });
  } catch (err) {
    console.error("Failed to create Stripe Checkout session:", err);
    // TEMP debugging aid — revert to a generic message once the live deploy is verified working.
    return { error: err instanceof Error ? err.message : "Could not start checkout." };
  }

  if (!session.url) {
    return { error: "Could not start checkout. Please try again." };
  }

  redirect(session.url);
}
