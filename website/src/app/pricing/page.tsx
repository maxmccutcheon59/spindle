import type { Metadata } from "next";
import Link from "next/link";
import { businessReasons, plans, site } from "@/lib/site";
import {
  CtaLink,
  SiteFooter,
  SiteHeader,
} from "@/components/site-chrome";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing notes — engine is free",
  description: `The Spindle engine is free (MIT). Builder ${plans[1].price} and Scale ${plans[2].price} are proposed early-access figures. They do not provision storage.`,
  alternates: { canonical: "/pricing/" },
};

export default function PricingPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
          Pricing
        </p>
        <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          The engine is free. The other prices are notes.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          Clone the MIT crate. Builder and Scale are proposed early-access
          figures from {site.author.name}. If Stripe keys are configured, a
          card can be charged. That does not provision storage, and there is
          no uptime target attached to either number.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {businessReasons.map((r) => (
            <div key={r.title} className="border-l-2 border-teal pl-4">
              <p className="font-semibold text-ink">{r.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 border-l-2 border-sand bg-card/70 px-4 py-3 text-sm leading-relaxed text-ink/90">
          <strong className="text-teal-deep">Checkout: </strong>
          Stripe Checkout or a Payment Link, only when keys are set. See{" "}
          <Link
            href="/enterprise/"
            className="font-medium text-teal-deep underline-offset-2 hover:underline"
          >
            Cloud notes
          </Link>{" "}
          and the{" "}
          <Link
            href="/case-study/"
            className="font-medium text-teal-deep underline-offset-2 hover:underline"
          >
            status page
          </Link>
          . The Rust engine is what{" "}
          <code className="font-mono text-xs">cargo test</code> covers.
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "flex flex-col border p-6",
                plan.highlighted
                  ? "border-teal bg-card shadow-[0_20px_50px_-28px_rgba(15,122,122,0.55)]"
                  : "border-border/80 bg-card/50",
              )}
            >
              {plan.highlighted ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-deep">
                  Ships today
                </p>
              ) : (
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Not provisioned
                </p>
              )}
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
                {plan.name}
              </h2>
              <p className="mt-3 flex items-baseline gap-1">
                <span className="font-mono text-4xl font-medium text-ink">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {plan.blurb}
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-ink/85">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-teal">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {plan.external ? (
                  <CtaLink
                    href={plan.href}
                    external
                    variant={plan.highlighted ? "primary" : "ghost"}
                    className="w-full"
                  >
                    {plan.cta}
                  </CtaLink>
                ) : (
                  <CtaLink
                    href={plan.href}
                    variant={plan.highlighted ? "primary" : "ghost"}
                    className="w-full"
                  >
                    {plan.cta}
                  </CtaLink>
                )}
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Questions before you pay? Email{" "}
          <a
            href={`mailto:${site.author.email}`}
            className="font-medium text-teal-deep underline-offset-2 hover:underline"
          >
            {site.author.email}
          </a>{" "}
          or read the{" "}
          <Link
            href="/design/"
            className="font-medium text-teal-deep underline-offset-2 hover:underline"
          >
            design notes
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
