"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { PlanId } from "@/lib/site";
import { plans, site } from "@/lib/site";
import { stripePaymentLink } from "@/lib/stripe";

function allowDemoCheckout(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NEXT_PUBLIC_ALLOW_DEMO_CHECKOUT === "1") return true;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

function checkoutApiUrl(): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${base}/api/checkout`;
}

export function SubscribeClient({ planId }: { planId: PlanId }) {
  const router = useRouter();
  const search = useSearchParams();
  const canceled = search.get("canceled") === "1";
  const plan = plans.find((p) => p.id === planId);
  const liveLink = useMemo(() => stripePaymentLink(planId), [planId]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"live" | "link" | "email" | "demo" | null>(
    null,
  );

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
    if (!plan || plan.id === "free") return;
    const selected = plan;
    if (!email.includes("@")) {
      setError("Enter a real email so Stripe can send the receipt.");
      return;
    }
    setBusy(true);

    // 1) Live Checkout API (Vercel / next start) — card + optional US bank.
    try {
      const res = await fetch(checkoutApiUrl(), {
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
    } catch {
      // Static host — fall through
    }

    // 2) Stripe Payment Links (GitHub Pages — real charges for every customer).
    if (liveLink) {
      setMode("link");
      const url = new URL(liveLink);
      url.searchParams.set("prefilled_email", email);
      window.location.href = url.toString();
      return;
    }

    // 3) Local / explicit demo only — never fake-subscribe public customers.
    if (allowDemoCheckout()) {
      setMode("demo");
      await new Promise((r) => setTimeout(r, 500));
      sessionStorage.setItem(
        "spindle_demo_sub",
        JSON.stringify({ plan: planId, email, at: Date.now() }),
      );
      router.push(`/subscribe/success/?plan=${planId}&demo=1`);
      return;
    }

    // 4) Production without Stripe yet — email the founder to complete payment.
    setMode("email");
    const subject = encodeURIComponent(
      `Spindle Cloud ${selected.name} subscription`,
    );
    const body = encodeURIComponent(
      `Hi Max,\n\nI'd like to subscribe to Spindle Cloud ${selected.name} (${selected.price}${selected.period}).\n\nWork email: ${email}\n\nPlease send a Stripe payment link or invoice.\n`,
    );
    window.location.href = `mailto:${site.author.email}?subject=${subject}&body=${body}`;
    setBusy(false);
  }

  const ctaLabel = liveLink
    ? `Pay ${plan.price}${plan.period} — card or bank`
    : allowDemoCheckout()
      ? `Start demo checkout · ${plan.price}${plan.period}`
      : `Email to subscribe · ${plan.price}${plan.period}`;

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
              : mode === "email"
                ? "Opening mail…"
                : "Opening secure checkout…"
            : ctaLabel}
        </button>
      </form>

      <div className="mt-4 space-y-2 text-xs leading-relaxed text-muted-foreground">
        <p>
          Available to every customer worldwide. Secure checkout is hosted by{" "}
          <strong className="text-ink/80">Stripe</strong> — cards globally; US
          bank (ACH) when enabled. Money settles to {site.author.name}&apos;s
          Stripe account, then payouts to his bank.
        </p>
        {!liveLink && !allowDemoCheckout() ? (
          <p className="border-l-2 border-sand pl-3 text-ink/80">
            Live Stripe Payment Links are being connected. Until then, the
            button emails{" "}
            <a
              className="font-medium text-teal-deep underline-offset-2 hover:underline"
              href={`mailto:${site.author.email}`}
            >
              {site.author.email}
            </a>{" "}
            so you can still subscribe — Max will send a payment link or
            invoice.
          </p>
        ) : null}
        {!liveLink && allowDemoCheckout() ? (
          <p className="border-l-2 border-border pl-3">
            Local demo mode — no card charged. Add Stripe keys (SETUP.md) for
            live payments.
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
