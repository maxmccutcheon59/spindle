"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CtaLink, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { site } from "@/lib/site";

function SuccessBody() {
  const sp = useSearchParams();
  const plan = sp.get("plan") === "scale" ? "Scale" : "Builder";
  const demo = sp.get("demo") === "1";
  const sessionId = sp.get("session_id");

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
        {demo ? "Demo checkout complete" : "Payment received"}
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-ink">
        {plan} subscription started.
      </h1>
      <p className="mt-4 text-muted-foreground">
        {demo
          ? "This was a local demo — no card was charged. Connect Stripe (SETUP.md) so real customers pay by card or bank and Max receives the money."
          : `Stripe confirmed your payment${sessionId ? ` (${sessionId.slice(0, 12)}…)` : ""}. A receipt goes to your email. Funds settle to ${site.author.name}’s Stripe account, then payout to his bank.`}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <CtaLink href="/get-started/">Open get started</CtaLink>
        <CtaLink href="/agent/" variant="ghost">
          Ask Spindle Agent
        </CtaLink>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Or{" "}
        <Link
          href="/"
          className="text-teal-deep underline-offset-2 hover:underline"
        >
          return home
        </Link>
        .
      </p>
    </>
  );
}

export default function SubscribeSuccessPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-5 py-16 md:px-8">
        <Suspense fallback={<p className="text-muted-foreground">Confirming…</p>}>
          <SuccessBody />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
