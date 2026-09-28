import type { Metadata } from "next";
import Link from "next/link";
import {
  CtaLink,
  SiteFooter,
  SiteHeader,
} from "@/components/site-chrome";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Case study — what Spindle actually is",
  description:
    "Honest case study: Spindle engine is real today; Spindle Cloud hosting is not built — there is a waitlist, nothing for sale. Positioning vs Dynamo-class friction without fake traction.",
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
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-ink sm:text-4xl md:text-5xl">
          What Spindle is — without the hype.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Founded by {site.author.name}. This page is the honest product brief
          for companies, recruiters, and anyone Googling the name.
        </p>

        <section className="mt-12 space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            Why teams evaluate Spindle vs Dynamo alone
          </h2>
          <p className="leading-relaxed text-ink/90">
            DynamoDB and peers win on raw hyperscale. Spindle aims at{" "}
            <strong>convenience teams can defend</strong>: an MIT engine you can
            open when storage misbehaves, portability out of one cloud, and
            founder-reachable support — plus the idea of one flat Cloud bill
            (no RCU/WCU spreadsheets){" "}
            <em>if hosted durability ships</em>. That is positioning, not a
            claim that businesses already rely on Spindle Cloud. See{" "}
            <Link
              className="text-teal-deep underline-offset-2 hover:underline"
              href="/enterprise/"
            >
              /enterprise/
            </Link>
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
            implemented and tested. Directional benches (mem put ~1.9µs, durable
            put ~238µs, flushed get ~8µs) are documented there.
          </p>
          <p className="leading-relaxed text-ink/90">
            <strong>Spindle Cloud hosting: not built.</strong> There is no
            public multi-tenant API endpoint, no hosted PITR / dashboards /
            uptime SLA, and no way to pay. The site, Agent (local brain on
            Pages; GPT needs a server + key), and playground are public. Cloud
            has a{" "}
            <Link
              className="text-teal-deep underline-offset-2 hover:underline"
              href="/cloud/"
            >
              waitlist
            </Link>{" "}
            so demand decides whether it gets built.
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
          <CtaLink href={site.github} external>
            Open the engine
          </CtaLink>
          <CtaLink
            href={`mailto:${site.author.email}?subject=Spindle%20Cloud%20early%20access`}
            external
            variant="ghost"
          >
            Email Max about Cloud
          </CtaLink>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
