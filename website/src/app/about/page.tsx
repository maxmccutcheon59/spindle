import type { Metadata } from "next";
import { site } from "@/lib/site";
import {
  CtaLink,
  SiteFooter,
  SiteHeader,
} from "@/components/site-chrome";

export const metadata: Metadata = {
  title: `About ${site.author.name}`,
  description: site.author.bio,
  alternates: { canonical: "/about/" },
  authors: [{ name: site.author.name, url: site.author.github }],
};

export default function AboutPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
          Founder
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          {site.author.name}
        </h1>
        <p className="mt-2 text-lg font-medium text-teal-deep">
          {site.author.role} · builder of {site.name}
        </p>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          {site.author.bio}
        </p>
        <p className="mt-4 rounded-md border border-teal/40 bg-card/80 px-4 py-3 text-sm leading-relaxed text-ink">
          <span className="font-semibold text-teal-deep">Contact & ownership: </span>
          <a
            className="font-semibold text-teal-deep underline-offset-2 hover:underline"
            href={`mailto:${site.author.email}`}
          >
            {site.author.email}
          </a>
          <span className="mt-2 block text-muted-foreground">{site.ownership}</span>
        </p>
        <div className="mt-10 space-y-6 border-l-2 border-teal pl-5">
          <p className="leading-relaxed text-ink/90">
            Spindle exists because I wanted an LSM I could walk end-to-end —
            memtable, WAL fsync policy, SSTable footer, compaction amp, MVCC
            sequences — without hand-waving. The design doc is the interview
            packet; the{" "}
            <code className="font-mono text-sm">kill -9</code> harness is the
            receipt.
          </p>
          <p className="leading-relaxed text-ink/90">
            Spindle Cloud is the company product on top of that engine —
            managed durability, Stripe subscriptions, same codebase. I&apos;m
            the founder. Source stays MIT; Builder and Scale are the hosted
            plans.
          </p>
          <p className="leading-relaxed text-ink/90">
            <strong className="text-ink">Legal stance today:</strong> there is
            no separate corporation yet — you contract with me, {site.author.name}.
            When I register an LLC/Corp, Spindle IP and Cloud contracts assign
            into that entity. The product stays storage infrastructure SaaS
            (KV / Cloud / Agent on top of our engine) — not a rebrand into
            robotics or a generic “AI holding company.” Expansion happens from
            a working Spindle, not a slogan.
          </p>
        </div>
        <dl className="mt-12 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              GitHub
            </dt>
            <dd className="mt-1">
              <a
                className="font-medium text-teal-deep underline-offset-2 hover:underline"
                href={site.author.github}
              >
                @{site.author.handle}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Email
            </dt>
            <dd className="mt-1">
              <a
                className="font-medium text-teal-deep underline-offset-2 hover:underline"
                href={`mailto:${site.author.email}`}
              >
                {site.author.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Repository
            </dt>
            <dd className="mt-1">
              <a
                className="font-medium text-teal-deep underline-offset-2 hover:underline"
                href={site.github}
              >
                maxmccutcheon59/spindle
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Design notes
            </dt>
            <dd className="mt-1">
              <a
                className="font-medium text-teal-deep underline-offset-2 hover:underline"
                href={site.design}
              >
                DESIGN.md
              </a>
            </dd>
          </div>
        </dl>
        <div className="mt-12 flex flex-wrap gap-3">
          <CtaLink href="/pricing/">See Cloud pricing</CtaLink>
          <CtaLink href={site.github} external variant="ghost">
            Open the engine
          </CtaLink>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
