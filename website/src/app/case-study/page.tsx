import type { Metadata } from "next";
import { CtaLink, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Status — what ships today",
  description:
    "Honest status: the Spindle Rust LSM engine ships; Cloud, Stripe, and Agent pages are an early-access website experiment with no tenants and no provisioned storage.",
  alternates: { canonical: "/case-study/" },
};

export default function CaseStudyPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
          Status
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          What ships, and what is only a page.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Written by {site.author.name} for anyone reading the repo or the
          site. This is a status note, not a customer story.
        </p>

        <section className="mt-12 space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            The engine works
          </h2>
          <p className="leading-relaxed text-ink/90">
            Spindle is a Rust LSM you can clone,{" "}
            <code className="font-mono text-sm">cargo test</code>, crash with{" "}
            <code className="font-mono text-sm">kill -9</code>, and walk in{" "}
            <a
              className="text-teal-deep underline-offset-2 hover:underline"
              href={site.design}
            >
              DESIGN.md
            </a>
            . WAL, memtable, SSTables, leveled compaction, blooms, scans, and
            MVCC are implemented and tested. Try{" "}
            <code className="font-mono text-sm">
              cargo run --example quickstart
            </code>
            .
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            Cloud does not
          </h2>
          <p className="leading-relaxed text-ink/90">
            The website, pricing copy, Stripe wiring, Agent, and playground
            are an early-access experiment. There is no multi-tenant control
            plane, no storage quota, and no uptime target. The playground is
            a browser mock. Agent answers come from a local script unless you
            run the server with an API key.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            Payments
          </h2>
          <p className="leading-relaxed text-ink/90">
            If Stripe keys are set, checkout can charge a card (and US bank
            debit when that method is enabled). Money would land in{" "}
            {site.author.name}&apos;s Stripe account. A charge does not
            provision a database. Without keys, the public site asks you to
            email him instead of pretending a subscription started. There is
            no separate company; see <code className="font-mono text-sm">website/LEGAL.md</code>.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            Pricing
          </h2>
          <p className="leading-relaxed text-ink/90">
            <strong>$0</strong> is the engine. <strong>$49 / $149</strong> are
            proposed early-access figures on a page, not a forecast of a live
            bill for capacity that exists.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            Prior art
          </h2>
          <p className="leading-relaxed text-ink/90">
            LSM trees are not new. LevelDB, RocksDB, and Badger exist.
            Spindle is a readable implementation with crash tests and an
            honest bench section — a hiring artifact for systems work, not a
            claim of a new database category.
          </p>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <CtaLink href="/get-started/">Run the demo</CtaLink>
          <CtaLink href={site.github} external variant="ghost">
            GitHub
          </CtaLink>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
