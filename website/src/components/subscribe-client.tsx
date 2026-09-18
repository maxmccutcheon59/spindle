"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PlanId } from "@/lib/site";
import { plans, stripePaymentLink } from "@/lib/site";

export function SubscribeClient({ planId }: { planId: PlanId }) {
  const router = useRouter();
  const plan = plans.find((p) => p.id === planId);
  const liveLink = useMemo(() => stripePaymentLink(planId), [planId]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!plan || plan.id === "free") {
    return (
      <p className="text-muted-foreground">
        Unknown plan.{" "}
        <Link href="/pricing/" className="text-teal-deep underline">
          Back to pricing
        </Link>
      </p>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) {
      setError("Enter a real email so we can send the receipt.");
      return;
    }
    setBusy(true);

    if (liveLink) {
      const url = new URL(liveLink);
      url.searchParams.set("prefilled_email", email);
      window.location.href = url.toString();
      return;
    }

    // Demo checkout — proves the paid flow without Stripe keys.
    await new Promise((r) => setTimeout(r, 900));
    sessionStorage.setItem(
      "spindle_demo_sub",
      JSON.stringify({ plan: planId, email, at: Date.now() }),
    );
    router.push(`/subscribe/success/?plan=${planId}&demo=1`);
  }

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
        Subscribe
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-ink">
        {plan.name} · {plan.price}
        <span className="text-lg font-semibold text-muted-foreground">
          {plan.period}
        </span>
      </h1>
      <p className="mt-3 text-muted-foreground">{plan.blurb}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm font-medium text-ink">
          Work email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2.5 text-base text-ink outline-none ring-teal focus:ring-2"
            autoComplete="email"
          />
        </label>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center rounded-md bg-teal px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-teal-deep disabled:opacity-60"
        >
          {busy
            ? "Redirecting…"
            : liveLink
              ? `Pay ${plan.price}${plan.period} with Stripe`
              : `Start demo checkout · ${plan.price}${plan.period}`}
        </button>
      </form>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        {liveLink
          ? "Secure checkout is hosted by Stripe. You can cancel from the customer portal."
          : "Demo mode: no Stripe keys configured. Completing this flow stores a local demo subscription so you can walk the SaaS UX. Add Payment Links in .env for live charges."}
      </p>

      <ul className="mt-8 space-y-2 border-t border-border/80 pt-6 text-sm text-muted-foreground">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="text-teal">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
