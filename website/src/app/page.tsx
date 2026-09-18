import { benches, credentials, saasPromises, site, stack } from "@/lib/site";
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
            <p className="animate-rise-delay-1 mt-3 text-sm font-semibold tracking-wide text-teal-deep md:text-base">
              by {site.author.name}
            </p>
            <h1 className="animate-rise-delay-1 mt-5 max-w-xl text-2xl font-semibold leading-snug text-ink/90 md:text-3xl">
              Managed LSM storage worth the subscription.
            </h1>
            <p className="animate-rise-delay-2 mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              A crash-tested Rust key-value engine — WAL, leveled compaction,
              MVCC — with {site.product} when you want Max running it for you.
            </p>
            <div className="animate-rise-delay-3 mt-8 flex flex-wrap gap-3">
              <CtaLink href="/agent/">Talk to Spindle Agent</CtaLink>
              <CtaLink href="/pricing/" variant="ghost">
                See pricing
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
              Why teams pay
            </p>
            <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Not another mystery database. A contract you can read.
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
            Cloud sits on the same LevelDB-shaped core Max published — small
            enough to audit, serious enough to sell.
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
              Directional numbers, not a paper claim.
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Criterion on a Cloud Agent VM (2026-09-18). Full notes in{" "}
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
            <p className="mt-8 text-sm text-muted-foreground">
              Questions for the owner?{" "}
              <a
                className="font-semibold text-teal-deep underline-offset-2 hover:underline"
                href={`mailto:${site.author.email}`}
              >
                {site.author.email}
              </a>
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
            Maker
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink md:text-4xl">
            {site.author.name}
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {site.author.bio}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaLink href="/about/">About Max</CtaLink>
            <CtaLink href={site.author.github} external variant="ghost">
              @{site.author.handle}
            </CtaLink>
          </div>
        </section>

        <section className="bg-ink text-mist">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 py-16 md:flex-row md:items-center md:px-8 md:py-20">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight md:text-4xl">
                Start Cloud today. Keep the source forever.
              </h2>
              <p className="mt-3 max-w-xl text-mist/75">
                Builder is $49/mo. Scale is $149/mo. Or clone Max&apos;s engine
                and pay nothing but your own disk.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <CtaLink
                href="/subscribe/builder/"
                className="bg-sand text-ink hover:bg-sand/90"
              >
                Subscribe · Builder
              </CtaLink>
              <CtaLink
                href="/playground/"
                variant="ghost"
                className="text-mist ring-mist/30 hover:bg-white/5"
              >
                Open playground
              </CtaLink>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
