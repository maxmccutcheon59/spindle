import type { Metadata } from "next";
import { Playground } from "@/components/playground";
import {
  CtaLink,
  SiteFooter,
  SiteHeader,
} from "@/components/site-chrome";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Playground",
  description: `Interactive demo of ${site.author.name}'s Spindle put/get/delete/flush API — try the memtable and WAL log in your browser.`,
  alternates: { canonical: "/playground/" },
};

export default function PlaygroundPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
          Playground
        </p>
        <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          Put a key. Watch the log.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          A browser sketch of {site.author.name}&apos;s Spindle API — memtable,
          sequence numbers, tombstones, flush to L0. The real engine is Rust on{" "}
          <a
            href={site.github}
            className="font-medium text-teal-deep underline-offset-2 hover:underline"
          >
            GitHub
          </a>
          .
        </p>
        <div className="mt-10">
          <Playground />
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <CtaLink href="/get-started/">Run the real crate</CtaLink>
          <CtaLink href="/design/" variant="ghost">
            Read the design
          </CtaLink>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
