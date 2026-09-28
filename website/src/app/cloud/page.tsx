import type { Metadata } from "next";
import Link from "next/link";
import { businessReasons, site, waitlistHref } from "@/lib/site";
import {
  CtaLink,
  SiteFooter,
  SiteHeader,
} from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Spindle Cloud — waitlist",
  description: `The Spindle engine is MIT and free today. ${site.product} (managed hosting) is not live and nothing is for sale — join the waitlist by emailing ${site.author.email}.`,
  alternates: { canonical: "/cloud/" },
};

const openSource = [
  "MIT-licensed Rust LSM engine",
  "WAL, SSTables, leveled compaction, MVCC",
  "kill -9 crash tests in CI",
  "Embed in your product — take it with you",
];

const cloudGoals = [
  "Managed durable storage behind a put / get / scan API",
  "Snapshots and point-in-time recovery",
  "One flat monthly price instead of capacity units",
  "The same open engine under the hood",
];

export default function CloudPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
          {site.product}
        </p>
        <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          The engine is free today. Cloud has a waitlist.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          The Rust LSM is MIT-licensed and real. {site.product} — managed
          hosting on top of it —{" "}
          <strong className="font-semibold text-ink/90">
            is not live, and nothing is for sale
          </strong>
          . If you would use it, join the waitlist and tell me about your
          workload; that decides whether it gets built.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <article className="flex flex-col border border-teal bg-card p-6 shadow-[0_20px_50px_-28px_rgba(15,122,122,0.55)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-deep">
              Available now
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
              Open source
            </h2>
            <p className="mt-3 flex items-baseline gap-1">
              <span className="font-mono text-4xl font-medium text-ink">$0</span>
              <span className="text-sm text-muted-foreground">forever</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-sm text-ink/85">
              {openSource.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-teal">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <CtaLink href={site.github} external className="w-full">
                View on GitHub
              </CtaLink>
            </div>
          </article>

          <article className="flex flex-col border border-border/80 bg-card/50 p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Exploring · not built
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
              {site.product}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              What a managed version would aim for. These are goals, not
              features — there is no hosted endpoint, SLA, or price today.
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-sm text-ink/85">
              {cloudGoals.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-muted-foreground">○</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <a
                href={waitlistHref}
                className="inline-flex w-full items-center justify-center rounded-md bg-teal px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-teal-deep"
              >
                Join the waitlist
              </a>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Opens an email to {site.author.email}. No payment, no account.
              </p>
            </div>
          </article>
        </div>

        <h2 className="mt-16 font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
          Why a managed Spindle might be worth building
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {businessReasons.map((r) => (
            <div key={r.title} className="border-l-2 border-teal pl-4">
              <p className="font-semibold text-ink">{r.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          Want the details first? Read the{" "}
          <Link
            href="/design/"
            className="font-medium text-teal-deep underline-offset-2 hover:underline"
          >
            design notes
          </Link>{" "}
          or the{" "}
          <Link
            href="/case-study/"
            className="font-medium text-teal-deep underline-offset-2 hover:underline"
          >
            case study
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
