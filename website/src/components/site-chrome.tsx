import Link from "next/link";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const links = [
  { href: "/enterprise/", label: "Enterprise" },
  { href: "/agent/", label: "Agent" },
  { href: "/playground/", label: "Playground" },
  { href: "/pricing/", label: "Pricing" },
  { href: "/case-study/", label: "Case study" },
  { href: "/about/", label: "About" },
] as const;

export function SiteHeader() {
  return (
    <header className="relative z-20">
      <div className="border-b border-border/60 bg-ink text-mist">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-2 text-xs md:px-8">
          <p className="font-medium">
            Sole owner:{" "}
            <span className="text-sand">{site.author.name}</span>
          </p>
          <a
            className="font-semibold text-sand underline-offset-2 hover:text-white hover:underline"
            href={`mailto:${site.author.email}`}
          >
            {site.author.email}
          </a>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 md:px-8">
      <div className="flex items-baseline gap-3">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-ink transition-colors hover:text-teal"
        >
          {site.name}
        </Link>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          by{" "}
          <Link
            href="/about/"
            className="font-semibold text-ink/80 underline-offset-2 hover:text-teal hover:underline"
          >
            {site.author.name}
          </Link>
        </span>
      </div>
      <nav
        aria-label="Primary"
        className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-ink"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/subscribe/builder/"
          className="rounded-md bg-teal px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 hover:bg-teal-deep"
        >
          Start · $49/mo
        </Link>
      </nav>
      <Link
        href="/pricing/"
        className="rounded-md bg-teal px-3 py-2 text-sm font-semibold text-primary-foreground lg:hidden"
      >
        Pricing
      </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-border/70 bg-ink text-mist">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl font-bold">
            {site.name}
          </p>
          <p className="mt-1 text-sm text-sand">
            Founded by {site.author.name}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-mist/75">
            {site.author.bio}
          </p>
          <p className="mt-4 text-sm">
            <a
              className="text-sand underline-offset-2 hover:text-white hover:underline"
              href={`mailto:${site.author.email}`}
            >
              {site.author.email}
            </a>
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand">
            Product
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="hover:text-white" href="/enterprise/">
                Enterprise
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/case-study/">
                Case study
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/pricing/">
                Pricing
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/agent/">
                Spindle Agent
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/playground/">
                Playground
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/subscribe/builder/">
                Start Builder
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/get-started/">
                Docs
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand">
            Founder
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="hover:text-white" href="/about/">
                About Max
              </Link>
            </li>
            <li>
              <a className="hover:text-white" href={site.author.github}>
                @{site.author.handle}
              </a>
            </li>
            <li>
              <a className="hover:text-white" href={site.design}>
                DESIGN.md
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand">
            Open source
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a className="hover:text-white" href={site.github}>
                GitHub · spindle
              </a>
            </li>
            <li>
              <a
                className="hover:text-white"
                href="https://opensource.org/licenses/MIT"
              >
                MIT License
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs leading-relaxed text-mist/55 md:px-8">
        <p>
          © {new Date().getFullYear()} {site.author.name} ·{" "}
          <a
            className="text-sand underline-offset-2 hover:text-white hover:underline"
            href={`mailto:${site.author.email}`}
          >
            {site.author.email}
          </a>
        </p>
        <p className="mx-auto mt-2 max-w-2xl">{site.ownership}</p>
        <p className="mt-2">Engine MIT · Cloud & Agent © {site.author.name}</p>
      </div>
    </footer>
  );
}

export function CtaLink({
  href,
  children,
  variant = "primary",
  external = false,
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  external?: boolean;
  className?: string;
}) {
  const styles =
    variant === "primary"
      ? "bg-teal text-primary-foreground hover:bg-teal-deep"
      : "bg-transparent text-ink ring-1 ring-ink/20 hover:bg-ink/5";

  const cls = cn(
    "inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5",
    styles,
    className,
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
