import type { Metadata } from "next";
import { site } from "@/lib/site";
import {
  CtaLink,
  SiteFooter,
  SiteHeader,
} from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Design notes",
  description:
    "Spindle design choices: memtable, WAL fsync policy, SSTable format, leveled compaction, MVCC, crash testing, and honest benchmark losses.",
  alternates: { canonical: "/design/" },
};

const notes = [
  {
    title: "Memtable",
    body: "BTreeMap with tombstones under a single writer. Readers observe Arc snapshots. Deletes stay until compaction so older snapshots remain correct.",
  },
  {
    title: "WAL + fsync",
    body: "Append-before-memtable. EveryWrite by default; group-commit optional. If we die after fsync but before memtable insert, replay restores the ACK'd write.",
  },
  {
    title: "SSTable layout",
    body: "Data blocks → bloom meta → index → 48-byte footer with magic SPNDLSST. Sparse index, restart-interval prefix compression, trailing CRC.",
  },
  {
    title: "Compaction",
    body: "Leveled ×10. L0 file-count trigger and per-level byte thresholds. Tombstones drop only at the bottom level.",
  },
  {
    title: "Known simplification",
    body: "Older versions may be dropped during compaction even if a long-lived snapshot still needs them. Snapshot correctness across compaction is tracked as future work.",
  },
] as const;

export default function DesignPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
          Design
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          Defend every choice.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Spindle's interview value is being able to walk the write path, the
          crash story, and the compaction amp without flipping open a wiki.
          This page is the short map — the long form lives in the repo.
        </p>

        <div className="mt-10 space-y-8">
          {notes.map((note) => (
            <article key={note.title} className="border-l-2 border-teal/70 pl-5">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
                {note.title}
              </h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {note.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <CtaLink href={site.design} external>
            Open DESIGN.md
          </CtaLink>
          <CtaLink href="/get-started/" variant="ghost">
            Get started
          </CtaLink>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
