import type { Metadata } from "next";
import {
  businessReasons,
  enterpriseWins,
  site,
  vsCloud,
} from "@/lib/site";
import {
  CtaLink,
  SiteFooter,
  SiteHeader,
} from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "For teams — Spindle vs Dynamo-class friction",
  description:
    "Why teams evaluate Spindle’s open Rust LSM vs DynamoDB-style KV: auditable engine today, a Cloud waitlist (not for sale), founder support — no fake enterprise traction claims.",
  alternates: { canonical: "/enterprise/" },
  keywords: [
    "DynamoDB alternative",
    "Spindle",
    "open source key-value store",
    "Max McCutcheon",
    "LSM tree Rust",
  ],
};

export default function EnterprisePage() {
  const compare = vsCloud[0];

  return (
    <div>
      <SiteHeader />
      <main>
        <section className="border-b border-border/80 bg-card/40">
          <div className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
              Teams &amp; platform orgs
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
              Why teams evaluate Spindle — and when Dynamo alone is exhausting.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Hyperscaler stores are excellent at being huge. They are worse at
              being simple, portable, and debuggable. Spindle is an open Rust
              LSM you can audit today, plus a founder-led Cloud{" "}
              <em>hypothesis</em> for durable KV without capacity theater —
              founded by {site.author.name}. This page is positioning, not a
              claim that enterprises already rely on Spindle Cloud.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href={site.github} external>
                Open the engine
              </CtaLink>
              <CtaLink
                href={`mailto:${site.author.email}?subject=Spindle%20Cloud%20early%20access`}
                external
                variant="ghost"
              >
                Talk to the founder
              </CtaLink>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
            The business case
          </p>
          <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink">
            Four reasons finance and platform both say “look closer.”
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {businessReasons.map((r) => (
              <article
                key={r.title}
                className="border-l-2 border-teal pl-5"
              >
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">
                  {r.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {r.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-border/80 bg-card/60">
          <div className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
              Why teams look at Spindle
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink">
              More convenient than a black box. More controllable than a cage.
            </h2>
            <div className="mt-10 space-y-8">
              {enterpriseWins.map((w) => (
                <article key={w.title}>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
                    {w.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {w.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-16">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink">
            Side-by-side vs Dynamo-class KV
          </h2>
          <p className="mt-3 text-muted-foreground">
            Aspirational positioning for where Spindle wants to win — engine
            columns are true today; Cloud columns are the founding bet.
          </p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 text-muted-foreground">—</th>
                  <th className="py-3 pr-4 text-muted-foreground">
                    {compare.them}
                  </th>
                  <th className="py-3 text-teal-deep">{compare.us}</th>
                </tr>
              </thead>
              <tbody>
                {compare.rows.map((row) => (
                  <tr key={row.label} className="border-b border-border/70">
                    <td className="py-3 pr-4 font-medium text-ink">
                      {row.label}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {row.them}
                    </td>
                    <td className="py-3 font-medium text-ink">{row.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-10 text-sm leading-relaxed text-muted-foreground">
            Spindle does not pretend to already match every global Dynamo
            feature — or to have enterprise customers today. It offers a sharper
            deal for teams that value{" "}
            <strong className="text-ink">
              source access, explainability, and (when hosted) predictable cost
            </strong>{" "}
            — with a Cloud path that stays founder-led while the hosted layer is
            built. Use Dynamo where you must; evaluate Spindle where convenience
            and ownership matter more.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <CtaLink href="/case-study/">Read the honest case study</CtaLink>
            <CtaLink href="/cloud/" variant="ghost">
              Cloud waitlist
            </CtaLink>
          </div>
        </section>

        <section className="bg-ink text-mist">
          <div className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-14 md:flex-row md:items-center md:justify-between md:px-8 md:py-16">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold md:text-3xl">
                Ready to evaluate a KV path you can own?
              </h2>
              <p className="mt-2 max-w-lg text-mist/75">
                Open engine. Founder on the thread. Cloud early access by email.
              </p>
            </div>
            <CtaLink
              href={`mailto:${site.author.email}?subject=Spindle%20for%20our%20team`}
              external
              className="bg-sand text-ink hover:bg-sand/90"
            >
              Email {site.author.email}
            </CtaLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
