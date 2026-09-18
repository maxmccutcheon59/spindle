import type { Metadata } from "next";
import { site } from "@/lib/site";
import {
  CtaLink,
  SiteFooter,
  SiteHeader,
} from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Get started",
  description:
    "Build and run Spindle: cargo test, clippy, microbenchmarks, and a minimal put/get/delete example in Rust.",
  alternates: { canonical: "/get-started/" },
};

export default function GetStartedPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
          Get started
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          Clone, test, put a key.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Spindle is a Rust crate. Rust 1.85+, then the usual cargo loop.
        </p>

        <ol className="mt-10 space-y-8">
          <li>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
              1. Clone
            </h2>
            <pre className="mt-3 overflow-x-auto rounded-md bg-ink p-4 font-mono text-sm text-mist">
              <code>{`git clone ${site.github}.git
cd spindle`}</code>
            </pre>
          </li>
          <li>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
              2. Test & lint
            </h2>
            <pre className="mt-3 overflow-x-auto rounded-md bg-ink p-4 font-mono text-sm text-mist">
              <code>{`cargo test
cargo clippy --all-targets -- -D warnings
cargo bench --bench basic`}</code>
            </pre>
          </li>
          <li>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
              3. Minimal API
            </h2>
            <pre className="mt-3 overflow-x-auto rounded-md bg-ink p-4 font-mono text-sm text-mist">
              <code>{`use spindle::{Db, Options};

let db = Db::open(Options::new("./spindle-data"))?;
db.put(b"hello", b"world")?;
assert_eq!(db.get(b"hello")?, Some(b"world".to_vec()));
db.delete(b"hello")?;`}</code>
            </pre>
          </li>
        </ol>

        <div className="mt-12 flex flex-wrap gap-3">
          <CtaLink href={site.github} external>
            GitHub repository
          </CtaLink>
          <CtaLink href="/design/" variant="ghost">
            Design notes
          </CtaLink>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
