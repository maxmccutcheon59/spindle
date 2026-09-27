import { benches, credentials, honestLimits, site, stack } from "@/lib/site";
import { LsmHeroVisual } from "@/components/lsm-hero-visual";
import { CtaLink, SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function HomePage() {
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
              By {site.author.name}
            </p>
            <h1 className="animate-rise-delay-1 mt-5 max-w-xl text-2xl font-semibold leading-snug text-ink/90 md:text-3xl">
              {site.tagline}
            </h1>
            <p className="animate-rise-delay-2 mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              Write-ahead log, memtable, SSTables, leveled compaction, and
              MVCC — a local library with crash tests and a design doc. MIT.
              Version 0.1.0. Cloud pages on this site are an early-access
              experiment, not a hosted database.
            </p>
            <div className="animate-rise-delay-3 mt-8 flex flex-wrap gap-3">
              <CtaLink href={site.github} external>
                Read the engine
              </CtaLink>
              <CtaLink href="/get-started/" variant="ghost">
                Clone and run the demo
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

        <section
          id="engine"
          className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
            Inside the engine
          </p>
          <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink md:text-4xl">
            One write path. One read path. Source you can open.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            The same LevelDB-shaped core as the GitHub crate. Walk it in
            DESIGN.md. Run it with cargo run --example quickstart.
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

        <section className="border-y border-border/80 bg-card/60 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
              Limits, stated
            </p>
            <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink md:text-4xl">
              What 0.1.0 does not do.
            </h2>
            <div className="mt-12 grid gap-10 md:grid-cols-2">
              {honestLimits.map((item) => (
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

        <section id="numbers" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
            Microbenchmarks
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink md:text-4xl">
            Directional numbers from one machine.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Short Criterion run on 2026-09-18, sample size 10, tmpfs. Not a
            paper result and not a comparison against a hosted database.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {benches.map((bench) => (
              <div key={bench.name} className="border-l-2 border-teal pl-5">
                <p className="text-sm text-muted-foreground">{bench.name}</p>
                <p className="mt-1 font-mono text-3xl font-medium text-ink">
                  {bench.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{bench.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border/80 bg-card/60 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
              Website / experimental Cloud notes
            </p>
            <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink md:text-4xl">
              A founder sketch beside the engine.
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Pages for Cloud ($49 / $149), Stripe, and Agent are early-access
              notes by {site.author.name}. They do not describe a service with
              tenants, storage quotas, or an uptime target. The in-browser
              playground is a mock.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href="/enterprise/" variant="ghost">
                Cloud notes
              </CtaLink>
              <CtaLink href="/case-study/" variant="ghost">
                What ships today
              </CtaLink>
              <CtaLink href={site.design} external variant="ghost">
                DESIGN.md
              </CtaLink>
            </div>
          </div>
        </section>

        <section className="bg-ink text-mist">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 py-16 md:flex-row md:items-center md:px-8 md:py-20">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight md:text-4xl">
                Clone it. Put a key. Read the crash story.
              </h2>
              <p className="mt-3 max-w-xl text-mist/75">
                cargo run --example quickstart. Then DESIGN.md if you want the
                interview depth. Email {site.author.email}.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <CtaLink
                href="/get-started/"
                className="bg-sand text-ink hover:bg-sand/90"
              >
                Get started
              </CtaLink>
              <CtaLink
                href={`mailto:${site.author.email}`}
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
