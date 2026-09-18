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
  title: "For enterprises — why Spindle beats DynamoDB friction",
  description:
    "Why businesses and large companies choose Spindle Cloud over DynamoDB-style KV: flat pricing, open engine, portability, founder support, and a simpler mental model.",
  alternates: { canonical: "/enterprise/" },
  keywords: [
    "DynamoDB alternative",
    "DynamoDB competitor",
    "Spindle Cloud",
    "enterprise key-value store",
    "Max McCutcheon",
    "predictable database pricing",
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
              Enterprises &amp; large teams
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
              Why companies need Spindle — and stop leaning on Dynamo-class KV
              alone.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Hyperscaler stores are excellent at being huge. They are worse at
              being simple, portable, and debuggable. Spindle is the convenient
              path for businesses that want durable KV{" "}
              <em>without</em> capacity theater, lock-in, or a support maze —
              founded by {site.author.name}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href="/subscribe/scale/">Start Scale · $149</CtaLink>
              <CtaLink
                href={`mailto:${site.author.email}?subject=Spindle%20enterprise`}
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
            Four reasons finance and platform both say yes.
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
              Why teams rely on Spindle
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
            Big clouds win on endless feature lists. Spindle wins where
            businesses actually feel pain every quarter.
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
            feature tomorrow morning. It offers a sharper deal for companies
            that value{" "}
            <strong className="text-ink">
              predictable cost, source access, and speed-to-clarity
            </strong>{" "}
            — with a Cloud path that stays founder-led while the hosted layer
            scales. Use Dynamo where you must; use Spindle where convenience and
            ownership matter more.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <CtaLink href="/subscribe/scale/">Start Scale · $149</CtaLink>
            <CtaLink href="/case-study/" variant="ghost">
              Read the honest case study
            </CtaLink>
          </div>
        </section>

        <section className="bg-ink text-mist">
          <div className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-14 md:flex-row md:items-center md:justify-between md:px-8 md:py-16">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold md:text-3xl">
                Ready to give your company a KV path it can own?
              </h2>
              <p className="mt-2 max-w-lg text-mist/75">
                Flat plans. Open engine. Founder on the thread.
              </p>
            </div>
            <CtaLink
              href={`mailto:${site.author.email}?subject=Spindle%20for%20our%20company`}
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
