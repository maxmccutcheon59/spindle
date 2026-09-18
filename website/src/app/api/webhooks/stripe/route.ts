import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe → Spindle webhook.
 * Configure in Dashboard → Developers → Webhooks →
 *   https://YOUR_DOMAIN/api/webhooks/stripe
 * Events: checkout.session.completed, customer.subscription.*
 *
 * Money still settles in your Stripe balance → payouts to your bank.
 * This endpoint is for logging / future provisioning.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  const stripe = new Stripe(secret, {
    apiVersion: "2025-02-24.acacia",
  });

  const raw = await req.text();
  let event: Stripe.Event;

  try {
    if (whSecret) {
      const sig = req.headers.get("stripe-signature");
      if (!sig) {
        return NextResponse.json({ error: "missing_signature" }, { status: 400 });
      }
      event = stripe.webhooks.constructEvent(raw, sig, whSecret);
    } else {
      // Dev-only path — always set STRIPE_WEBHOOK_SECRET in production.
      event = JSON.parse(raw) as Stripe.Event;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid payload";
    console.error("[stripe webhook]", message);
    return NextResponse.json({ error: "invalid_webhook", message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.info("[spindle] paid", {
        id: session.id,
        email: session.customer_email,
        plan: session.metadata?.plan ?? session.client_reference_id,
        amount_total: session.amount_total,
        currency: session.currency,
      });
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      console.info("[spindle] subscription", {
        id: sub.id,
        status: sub.status,
        plan: sub.metadata?.plan,
      });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
