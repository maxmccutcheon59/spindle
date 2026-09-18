import Link from "next/link";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#engine", label: "Engine" },
  { href: "/pricing/", label: "Pricing" },
  { href: "/design/", label: "Design" },
  { href: "/get-started/", label: "Docs" },
] as const;

export function SiteHeader() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-8">
      <Link
        href="/"
        className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-ink transition-colors hover:text-teal"
      >
        {site.name}
      </Link>
      <nav
        aria-label="Primary"
        className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex"
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
        className="rounded-md bg-teal px-3 py-2 text-sm font-semibold text-primary-foreground md:hidden"
      >
        Pricing
      </Link>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-border/70 bg-ink text-mist">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl font-bold">
            {site.name}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-mist/75">
            {site.product} — managed LSM storage on an open-source Rust engine
            by {site.author.name}.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand">
            Product
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="hover:text-white" href="/pricing/">
                Pricing
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
            Open source
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a className="hover:text-white" href={site.github}>
                GitHub
              </a>
            </li>
            <li>
              <a className="hover:text-white" href={site.design}>
                DESIGN.md
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
      <div className="border-t border-white/10 px-5 py-4 text-center text-xs text-mist/55 md:px-8">
        © {new Date().getFullYear()} {site.author.name}. Engine MIT · Cloud
        subscriptions billed via Stripe.
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
