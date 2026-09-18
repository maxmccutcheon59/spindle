import type { Metadata } from "next";
import {
  CtaLink,
  SiteFooter,
  SiteHeader,
} from "@/components/site-chrome";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Case study — what Spindle actually is",
  description:
    "Honest case study: Spindle engine today, Spindle Cloud + Stripe payments, why companies pick it over Dynamo-class friction, and what is still on the roadmap.",
  alternates: { canonical: "/case-study/" },
};

export default function CaseStudyPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
          Case study
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          What Spindle is — without the hype.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Founded by {site.author.name}. This page is the honest product brief
          for companies, recruiters, and anyone Googling the name.
        </p>

        <section className="mt-12 space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            Why businesses rely on Spindle instead of Dynamo alone
          </h2>
          <p className="leading-relaxed text-ink/90">
            DynamoDB and peers win on raw hyperscale. Spindle wins on{" "}
            <strong>convenience companies can defend</strong>: flat $49 / $149
            bills (no RCU/WCU spreadsheets), an MIT engine you can open when
            storage misbehaves, portability out of one cloud, and founder-reachable
            support. Platform and finance both get a story that fits in one
            meeting — see{" "}
            <a
              className="text-teal-deep underline-offset-2 hover:underline"
              href="/enterprise/"
            >
              /enterprise/
            </a>
            .
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            Does the product actually work?
          </h2>
          <p className="leading-relaxed text-ink/90">
            <strong>The engine: yes.</strong> Spindle is a real Rust LSM you can
            clone,{" "}
            <code className="font-mono text-sm">cargo test</code>, crash with{" "}
            <code className="font-mono text-sm">kill -9</code>, and walk in{" "}
            <a
              className="text-teal-deep underline-offset-2 hover:underline"
              href={site.design}
            >
              DESIGN.md
            </a>
            . WAL, memtable, SSTables, leveled compaction, blooms, scans, MVCC —
            implemented and tested.
          </p>
          <p className="leading-relaxed text-ink/90">
            <strong>Spindle Cloud hosting: early-access.</strong> The website,
            pricing, Stripe checkout (card / bank), Agent, and playground are
            live. Full multi-tenant provisioning at hyperscaler scale is the
            roadmap — not something we pretend already matches every Dynamo
            global-table footnote.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            How do customers pay — and who gets the money?
          </h2>
          <p className="leading-relaxed text-ink/90">
            Checkout runs on <strong>Stripe</strong>. Buyers pay with a credit
            card or (when enabled) a US bank account via ACH. Funds land in{" "}
            {site.author.name}&apos;s Stripe account and payout to his linked
            bank on Stripe&apos;s schedule. No fake gateways — configure keys
            once in SETUP.md and live charges work.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            Is the pricing competitive?
          </h2>
          <p className="leading-relaxed text-ink/90">
            <strong>$49 / $149</strong> is founder early-access pricing —
            forecastable SaaS lines, not a claim that Spindle already undercuts
            every Dynamo workload. Big clouds win on ecosystem. Spindle wins on
            readability, portability, and bills finance can model without a FinOps
            war room.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            Hasn’t this been done before?
          </h2>
          <p className="leading-relaxed text-ink/90">
            <strong>Yes — LSMs aren’t new.</strong> LevelDB, RocksDB, Badger,
            and a hundred papers exist. Spindle isn’t a research breakthrough.
            It’s a founder-built engine + product surface: crash stories,
            compaction amp, honest benches, and a Cloud path companies can
            subscribe to as it grows.
          </p>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <CtaLink href="/subscribe/builder/">Pay with Stripe · Builder</CtaLink>
          <CtaLink href="/enterprise/" variant="ghost">
            Enterprise brief
          </CtaLink>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
