import type { Metadata } from "next";
import Link from "next/link";
import { plans, site } from "@/lib/site";
import {
  CtaLink,
  SiteFooter,
  SiteHeader,
} from "@/components/site-chrome";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: `Spindle Cloud pricing — open source free, Builder ${plans[1].price}/mo, Scale ${plans[2].price}/mo. Managed LSM storage with crash-tested durability.`,
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
          Pay for ops. Keep the engine readable.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          {site.product} is the managed layer on the open-source Spindle LSM.
          Same durability story — without you paging yourself at 2am for
          compaction debt.
        </p>

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
                  Most chosen
                </p>
              ) : (
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {plan.id === "free" ? "Self-host" : "Production"}
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
          Questions before you subscribe?{" "}
          <Link
            href={site.github}
            className="font-medium text-teal-deep underline-offset-2 hover:underline"
          >
            Open an issue on GitHub
          </Link>{" "}
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
