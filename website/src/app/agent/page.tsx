import type { Metadata } from "next";
import { AgentChat } from "@/components/agent-chat";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Spindle Agent",
  description: `Spindle Agent answers questions about ${site.author.name}'s Rust LSM engine. Local knowledge base on Pages; GPT needs a server key.`,
  alternates: { canonical: "/agent/" },
};

export default function AgentPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">
          AI
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-ink sm:text-4xl md:text-5xl">
          Spindle Agent
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Ask about the engine: durability, compaction, MVCC, the API. On
          GitHub Pages it answers from a small local knowledge base (no
          server). Add{" "}
          <code className="font-mono text-sm">OPENAI_API_KEY</code> on a
          Next.js host for GPT-backed answers.
        </p>
        <div className="mt-8">
          <AgentChat />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
