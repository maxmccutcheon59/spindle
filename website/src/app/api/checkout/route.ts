import { NextResponse } from "next/server";
import Stripe from "stripe";
import type { PlanId } from "@/lib/site";
import { stripePriceId } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  plan?: string;
  email?: string;
};

function siteOrigin(req: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;
  const url = new URL(req.url);
  return url.origin;
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      {
        error: "stripe_not_configured",
        message:
          "Stripe secret key missing. Add STRIPE_SECRET_KEY and price IDs, or use Payment Links.",
      },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const plan = body.plan as PlanId | undefined;
  if (plan !== "builder" && plan !== "scale") {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!email.includes("@")) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const priceId = stripePriceId(plan);
  if (!priceId) {
    return NextResponse.json(
      {
        error: "price_missing",
        message: `Set STRIPE_PRICE_${plan.toUpperCase()} to your Stripe Price ID.`,
      },
      { status: 503 },
    );
  }

  const stripe = new Stripe(secret, {
    apiVersion: "2025-02-24.acacia",
  });

  const origin = siteOrigin(req);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  const baseParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    customer_email: email,
    client_reference_id: plan,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}${basePath}/subscribe/success/?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${basePath}/subscribe/${plan}/?canceled=1`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    metadata: {
      plan,
      product: "spindle_cloud",
      founder: "max_mccutcheon",
    },
    subscription_data: {
      metadata: {
        plan,
        product: "spindle_cloud",
      },
    },
  };

  // Card always. US bank (ACH) when enabled in Dashboard — set STRIPE_ENABLE_ACH=1.
  const withBank =
    process.env.STRIPE_ENABLE_ACH === "1" ||
    process.env.STRIPE_ENABLE_ACH === "true";

  try {
    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
        ...baseParams,
        payment_method_types: withBank
          ? ["card", "us_bank_account"]
          : ["card"],
      });
    } catch (firstErr) {
      // Retry card-only if ACH isn't activated on the Stripe account yet.
      if (withBank) {
        console.warn(
          "[stripe checkout] ACH failed, retrying card-only:",
          firstErr instanceof Error ? firstErr.message : firstErr,
        );
        session = await stripe.checkout.sessions.create({
          ...baseParams,
          payment_method_types: ["card"],
        });
      } else {
        throw firstErr;
      }
    }

    if (!session.url) {
      return NextResponse.json(
        { error: "no_checkout_url" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Stripe checkout failed";
    console.error("[stripe checkout]", message);
    return NextResponse.json(
      { error: "stripe_error", message },
      { status: 502 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    checkout: Boolean(process.env.STRIPE_SECRET_KEY),
    prices: {
      builder: Boolean(process.env.STRIPE_PRICE_BUILDER),
      scale: Boolean(process.env.STRIPE_PRICE_SCALE),
    },
  });
}
