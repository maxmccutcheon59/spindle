import { benches, site, stack } from "@/lib/site";
import { LsmHeroVisual } from "@/components/lsm-hero-visual";
import {
  CtaLink,
  SiteFooter,
  SiteHeader,
} from "@/components/site-chrome";

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
            <h1 className="animate-rise-delay-1 mt-6 max-w-xl text-2xl font-semibold leading-snug text-ink/90 md:text-3xl">
              Durable puts. Honest reads. An LSM you can read end-to-end.
            </h1>
            <p className="animate-rise-delay-2 mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              A Rust key-value engine with WAL, SSTables, leveled compaction,
              blooms, range scans, and MVCC — built to explain every trade-off
              out loud.
            </p>
            <div className="animate-rise-delay-3 mt-8 flex flex-wrap gap-3">
              <CtaLink href={site.github} external>
                View source
              </CtaLink>
              <CtaLink href="/get-started/" variant="ghost">
                Get started
              </CtaLink>
            </div>
          </div>

          <div className="animate-rise-delay-2 min-h-[320px] md:min-h-0">
            <LsmHeroVisual />
          </div>
        </section>

        <section
          id="engine"
          className="border-y border-border/80 bg-card/60 backdrop-blur-sm"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
              Inside the engine
            </p>
            <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink md:text-4xl">
              One write path. One read path. No mystery boxes.
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Spindle follows the LevelDB shape on purpose: small enough to
              audit, close enough to production engines that the interview
              vocabulary transfers.
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
          </div>
        </section>

        <section id="numbers" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
            Microbenchmarks
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink md:text-4xl">
            Directional numbers, not a paper claim.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Criterion on a Cloud Agent VM (2026-09-18), tmpfs-backed temp dirs,
            sample-size 10. Full notes and expected losses live in{" "}
            <a
              className="font-medium text-teal-deep underline-offset-2 hover:underline"
              href={site.design}
              target="_blank"
              rel="noopener noreferrer"
            >
              DESIGN.md §9
            </a>
            .
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
        </section>

        <section className="border-t border-border/80 bg-ink text-mist">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 py-16 md:flex-row md:items-center md:px-8 md:py-20">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight md:text-4xl">
                Read the design. Run the crash harness.
              </h2>
              <p className="mt-3 max-w-xl text-mist/75">
                Every durability claim has a test. Start with the README, then
                walk DESIGN.md like an interview packet.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <CtaLink href="/design/" className="bg-sand text-ink hover:bg-sand/90">
                Design notes
              </CtaLink>
              <CtaLink
                href={site.github}
                external
                variant="ghost"
                className="text-mist ring-mist/30 hover:bg-white/5"
              >
                Open repository
              </CtaLink>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
