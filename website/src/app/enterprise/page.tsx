import type { Metadata } from "next";
import { site } from "@/lib/site";
import { CtaLink, SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Cloud notes — early access",
  description:
    "What the Spindle website’s Cloud, Stripe, and Agent pages are: an early-access experiment next to an MIT Rust LSM engine. No hosted cluster and no customer base.",
  alternates: { canonical: "/enterprise/" },
  keywords: [
    "Spindle",
    "Spindle Cloud",
    "Max McCutcheon",
    "LSM tree Rust",
    "early access",
  ],
};

export default function EnterprisePage() {
  return (
    <div>
      <SiteHeader />
      <main>
        <section className="border-b border-border/80 bg-card/40">
          <div className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
              Website / experimental Cloud notes
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
              Cloud pages are a sketch. The engine is the project.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {site.author.name} maintains an MIT LSM in Rust. This URL used
              to read like a hosted product. It is an early-access founder
              experiment: pricing copy, a Stripe checkout path, and an Agent
              chat. None of that is a database you can point an application at.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href={site.github} external>
                Open the engine
              </CtaLink>
              <CtaLink
                href={`mailto:${site.author.email}?subject=Spindle`}
                external
                variant="ghost"
              >
                Email the author
              </CtaLink>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-16">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink">
            What exists today
          </h2>
          <ul className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-ink">Engine.</strong> WAL, memtable,
              SSTables, leveled compaction, blooms, scans, MVCC.{" "}
              <code className="font-mono text-xs">cargo test</code> and a{" "}
              <code className="font-mono text-xs">kill -9</code> harness.
              Design notes in DESIGN.md.
            </li>
            <li>
              <strong className="text-ink">This website.</strong> Static pages
              on GitHub Pages, plus API routes if you deploy somewhere that
              runs Next.js (see SETUP.md).
            </li>
            <li>
              <strong className="text-ink">Playground.</strong> An in-browser
              mock of put/get/delete/flush. It does not call the Rust crate.
            </li>
            <li>
              <strong className="text-ink">Agent.</strong> A small local reply
              table, or GPT if you set <code className="font-mono text-xs">OPENAI_API_KEY</code> on
              a server you run. GitHub Pages does not host that API.
            </li>
          </ul>
        </section>

        <section className="border-y border-border/80 bg-card/60">
          <div className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-16">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink">
              What the $49 and $149 lines mean
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              They are proposed early-access prices on the pricing page. They
              are not quotas, regions, or support tiers. If Stripe keys are
              configured, checkout can charge a card to {site.author.name}.
              That charge does not create storage, an endpoint, snapshots, or
              an uptime commitment. There is no customer list and no company
              entity behind the name.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              If a hosted KV is built later, it will be described as what it
              is at that time. This page will not be used to imply that it
              already exists.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href="/pricing/" variant="ghost">
                Pricing notes
              </CtaLink>
              <CtaLink href="/case-study/" variant="ghost">
                Status
              </CtaLink>
            </div>
          </div>
        </section>

        <section className="bg-ink text-mist">
          <div className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-14 md:flex-row md:items-center md:justify-between md:px-8 md:py-16">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold md:text-3xl">
                The interview packet is the crate.
              </h2>
              <p className="mt-2 max-w-lg text-mist/75">
                DESIGN.md, the crash test, and the quickstart example.
              </p>
            </div>
            <CtaLink
              href={site.design}
              external
              className="bg-sand text-ink hover:bg-sand/90"
            >
              Open DESIGN.md
            </CtaLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
