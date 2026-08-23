import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderReceiptEmail } from "@/lib/email";

// Stripe requires the raw request body to verify the webhook signature, so this
// must be a route handler (not a server action) — the app otherwise favors
// server actions for mutations (see PLAN.md Phase 10/12 notes).
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await recordOrder(event.data.object as Stripe.Checkout.Session);
  }

  return NextResponse.json({ received: true });
}

async function recordOrder(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient();

  // Idempotent: Stripe can retry/redeliver the same event more than once.
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();
  if (existing) return;

  const contactEmail = session.customer_details?.email ?? session.customer_email;
  if (!contactEmail) {
    console.error(
      `Checkout session ${session.id} completed with no contact email — skipping order.`,
    );
    return;
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ["data.price.product"],
  });

  const subtotal = lineItems.data.reduce((sum, item) => sum + item.amount_subtotal, 0) / 100;
  const total = (session.amount_total ?? 0) / 100;
  const shippingDetails = session.collected_information?.shipping_details;

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: session.client_reference_id || null,
      status: "pending",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string" ? session.payment_intent : null,
      currency: session.currency ?? "usd",
      subtotal,
      total,
      contact_email: contactEmail,
      shipping_address: shippingDetails ? JSON.parse(JSON.stringify(shippingDetails)) : null,
    })
    .select("id")
    .single();
  if (error || !order) {
    console.error(`Failed to write order for session ${session.id}:`, error);
    return;
  }

  const orderItems = lineItems.data.map((item) => {
    const product = item.price?.product;
    const productId =
      product && typeof product !== "string" && !("deleted" in product && product.deleted)
        ? ((product.metadata?.product_id as string | undefined) ?? null)
        : null;
    return {
      order_id: order.id,
      product_id: productId,
      product_name: item.description ?? "Product",
      unit_price: (item.price?.unit_amount ?? 0) / 100,
      quantity: item.quantity ?? 1,
    };
  });

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) {
    console.error(`Failed to write order items for order ${order.id}:`, itemsError);
  }

  await sendOrderReceiptEmail({
    id: order.id,
    contactEmail,
    total,
    currency: session.currency ?? "usd",
  });
}
