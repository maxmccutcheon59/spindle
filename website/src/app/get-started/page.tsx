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
    "Clone Spindle and run cargo run --example quickstart: put, get, delete, flush, and scan on the Rust LSM.",
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
          Spindle is a Rust crate. Rust 1.85+ (the repo pins 1.85.0). The
          quickstart prints put, get, delete, flush, scan, and a reopen.
          Cloud pages are a separate early-access experiment and are not
          required to use the engine.
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
              2. Run the demo
            </h2>
            <pre className="mt-3 overflow-x-auto rounded-md bg-ink p-4 font-mono text-sm text-mist">
              <code>{`cargo run --example quickstart`}</code>
            </pre>
          </li>
          <li>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
              3. Test & lint
            </h2>
            <pre className="mt-3 overflow-x-auto rounded-md bg-ink p-4 font-mono text-sm text-mist">
              <code>{`cargo test
cargo clippy --all-targets -- -D warnings
cargo bench --bench basic`}</code>
            </pre>
          </li>
          <li>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
              4. Minimal API
            </h2>
            <pre className="mt-3 overflow-x-auto rounded-md bg-ink p-4 font-mono text-sm text-mist">
              <code>{`use spindle::{Db, Options};

let db = Db::open(Options::new("./spindle-data"))?;
db.put(b"hello", b"world")?;
assert_eq!(db.get(b"hello")?.as_deref(), Some(b"world".as_slice()));
db.delete(b"hello")?;
db.flush()?;
for kv in db.scan(None, None)? {
    let _ = (kv.key, kv.value);
}`}</code>
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
