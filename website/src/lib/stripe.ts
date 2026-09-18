import type { PlanId } from "@/lib/site";

export function stripePaymentLink(plan: PlanId): string | null {
  if (typeof process === "undefined") return null;
  if (plan === "builder") {
    return process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BUILDER || null;
  }
  return process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_SCALE || null;
}

/** True when server can create live Checkout Sessions (card + bank). */
export function stripeCheckoutConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_BUILDER &&
      process.env.STRIPE_PRICE_SCALE,
  );
}

export function stripePriceId(plan: PlanId): string | null {
  if (plan === "builder") return process.env.STRIPE_PRICE_BUILDER || null;
  return process.env.STRIPE_PRICE_SCALE || null;
}

/** Client-visible: Payment Links work on static Pages without a server. */
export function hasPublicStripeLink(plan: PlanId): boolean {
  return Boolean(stripePaymentLink(plan));
}
