import {
  benches,
  credentials,
  enterpriseWins,
  saasPromises,
  site,
  stack,
  vsCloud,
} from "@/lib/site";
import { LsmHeroVisual } from "@/components/lsm-hero-visual";
import {
  CtaLink,
  SiteFooter,
  SiteHeader,
} from "@/components/site-chrome";

export default function HomePage() {
  const compare = vsCloud[0];

  return (
    <div className="relative">
      <SiteHeader />

      <main>
        <section className="relative mx-auto grid min-h-[calc(100vh-4.5rem)] w-full max-w-6xl items-stretch gap-8 px-5 pb-10 pt-4 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:pb-16">
          <div className="flex flex-col justify-center py-6 md:py-10">
            <p className="animate-rise font-[family-name:var(--font-display)] text-5xl font-extrabold leading-[0.92] tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl">
              {site.name}
            </p>
            <p className="animate-rise-delay-1 mt-3 text-sm font-semibold tracking-wide text-teal-deep md:text-base">
              Founded by {site.author.name}
            </p>
            <h1 className="animate-rise-delay-1 mt-5 max-w-xl text-2xl font-semibold leading-snug text-ink/90 md:text-3xl">
              An open Rust LSM you can audit — without DynamoDB lock-in.
            </h1>
            <p className="animate-rise-delay-2 mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              Durable puts. Readable write path. Crash tests that survive{" "}
              <code className="font-mono text-sm">kill -9</code>. The engine is
              real and MIT on GitHub. {site.product} — managed flat-priced
              hosting — is the founding roadmap, not a live multi-tenant product
              yet.
            </p>
            <div className="animate-rise-delay-3 mt-8 flex flex-wrap gap-3">
              <CtaLink href={site.github} external>
                Open the engine
              </CtaLink>
              <CtaLink href="/get-started/" variant="ghost">
                Get started
              </CtaLink>
              <CtaLink href="/case-study/" variant="ghost">
                Honest brief
              </CtaLink>
            </div>
          </div>

          <div className="animate-rise-delay-2 min-h-[320px] md:min-h-0">
            <LsmHeroVisual />
          </div>
        </section>

        <section className="border-y border-border/70 bg-ink text-mist">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-8 md:grid-cols-4 md:px-8">
            {credentials.map((c) => (
              <div key={c.label}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sand/80">
                  {c.label}
                </p>
                {c.label === "Email" ? (
                  <a
                    href={`mailto:${c.value}`}
                    className="mt-1 block font-mono text-sm text-sand underline-offset-2 hover:text-white hover:underline"
                  >
                    {c.value}
                  </a>
                ) : (
                  <p className="mt-1 font-mono text-sm text-mist">{c.value}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-border/80 bg-card/60 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
              Why teams look at Spindle
            </p>
            <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink md:text-4xl">
              More convenient than a black box. More controllable than a cage.
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
              Positioning vs hyperscaler KV friction — not a claim that
              enterprises already rely on Spindle Cloud.
            </p>
            <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {enterpriseWins.map((item) => (
                <article key={item.title}>
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
            vs hyperscaler KV
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink md:text-4xl">
            Dynamo-class power. Spindle-class clarity.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Big clouds win on endless feature lists. Spindle aims where teams
            feel pain: billing clarity, portability, and a support path that
            reaches a human who built the fsync policy. Engine columns below are
            true today; Cloud columns are goals for a product that is not built.
          </p>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 font-semibold text-muted-foreground">
                    —
                  </th>
                  <th className="py-3 pr-4 font-semibold text-muted-foreground">
                    {compare.them}
                  </th>
                  <th className="py-3 font-semibold text-teal-deep">
                    {compare.us}
                  </th>
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
        </section>

        <section className="border-y border-border/80 bg-card/60 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
              What is real vs roadmap
            </p>
            <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Built for teams that ship — and for founders who refuse fake SaaS.
            </h2>
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              {saasPromises.map((item) => (
                <article key={item.title}>
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="engine"
          className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
            Inside the engine
          </p>
          <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink md:text-4xl">
            One write path. One read path. No mystery boxes.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            The same LevelDB-shaped core the company publishes — small enough to
            audit, serious enough to build on. Cloud, when it ships, sits on this
            path.
          </p>
          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {stack.map((item) => (
              <article key={item.title}>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="numbers"
          className="border-y border-border/80 bg-card/60 backdrop-blur-sm"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
              Microbenchmarks
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Directional numbers from the open engine.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              From Criterion runs documented in DESIGN.md — not Cloud SLA
              numbers.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {benches.map((bench) => (
                <div key={bench.name} className="border-l-2 border-teal pl-5">
                  <p className="text-sm text-muted-foreground">{bench.name}</p>
                  <p className="mt-1 font-mono text-3xl font-medium text-ink">
                    {bench.value}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {bench.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ink text-mist">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 py-16 md:flex-row md:items-center md:px-8 md:py-20">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight md:text-4xl">
                Give your stack a KV path it can own.
              </h2>
              <p className="mt-3 max-w-xl text-mist/75">
                Start with the MIT engine. Talk to the founder about Cloud early
                access when something matters.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <CtaLink
                href={site.github}
                external
                className="bg-sand text-ink hover:bg-sand/90"
              >
                GitHub · spindle
              </CtaLink>
              <CtaLink
                href={`mailto:${site.author.email}?subject=Spindle%20Cloud%20early%20access`}
                external
                variant="ghost"
                className="text-mist ring-mist/30 hover:bg-white/5"
              >
                Email Max
              </CtaLink>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
