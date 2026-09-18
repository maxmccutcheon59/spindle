"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { PlanId } from "@/lib/site";
import { plans } from "@/lib/site";
import { stripePaymentLink } from "@/lib/stripe";

export function SubscribeClient({ planId }: { planId: PlanId }) {
  const router = useRouter();
  const search = useSearchParams();
  const canceled = search.get("canceled") === "1";
  const plan = plans.find((p) => p.id === planId);
  const liveLink = useMemo(() => stripePaymentLink(planId), [planId]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"live" | "link" | "demo" | null>(null);

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
      setError("Enter a real email so Stripe can send the receipt.");
      return;
    }
    setBusy(true);

    // 1) Prefer live Checkout API (card + optional US bank → money to your Stripe).
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, email }),
      });
      if (res.ok) {
        const data = (await res.json()) as { url?: string };
        if (data.url) {
          setMode("live");
          window.location.href = data.url;
          return;
        }
      }
      // 503 / missing keys → fall through to Payment Link or demo
    } catch {
      // Static host / offline API — fall through
    }

    // 2) Stripe Payment Links (works on GitHub Pages — still real charges).
    if (liveLink) {
      setMode("link");
      const url = new URL(liveLink);
      url.searchParams.set("prefilled_email", email);
      window.location.href = url.toString();
      return;
    }

    // 3) Demo only when Stripe is not configured yet.
    setMode("demo");
    await new Promise((r) => setTimeout(r, 700));
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

      {canceled ? (
        <p className="mt-4 border-l-2 border-sand bg-card/70 px-3 py-2 text-sm text-ink/90">
          Checkout canceled — no charge. You can try again anytime.
        </p>
      ) : null}

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
            ? mode === "demo"
              ? "Finishing demo…"
              : "Opening secure checkout…"
            : `Pay ${plan.price}${plan.period} — card or bank`}
        </button>
      </form>

      <div className="mt-4 space-y-2 text-xs leading-relaxed text-muted-foreground">
        <p>
          Secure checkout is hosted by{" "}
          <strong className="text-ink/80">Stripe</strong>. Cards worldwide; US
          bank (ACH) when enabled on the Spindle Stripe account. Money goes to
          Max McCutcheon&apos;s Stripe balance, then payouts to his bank.
        </p>
        {!liveLink ? (
          <p className="border-l-2 border-border pl-3">
            If checkout opens in <em>demo mode</em>, Stripe keys are not on this
            host yet — the founder still needs to paste live keys (see SETUP.md).
            No real card is charged in demo mode.
          </p>
        ) : null}
      </div>

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
