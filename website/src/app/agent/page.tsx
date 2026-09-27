import type { Metadata } from "next";
import { AgentChat } from "@/components/agent-chat";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Spindle Agent",
  description: `Spindle Agent — ${site.author.name}'s assistant for the Rust LSM engine and Cloud roadmap. Local knowledge brain on Pages; GPT needs a server key.`,
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
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          Spindle Agent
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Co-pilot for Max&apos;s engine and Cloud roadmap — durability,
          pricing hypotheses, APIs, and workload fit. On GitHub Pages the local
          Spindle brain answers from product docs (no server). Add{" "}
          <code className="font-mono text-sm">OPENAI_API_KEY</code> on a
          Next.js host for GPT-backed answers. Does not invent customers or live
          Cloud SLAs.
        </p>
        <div className="mt-8">
          <AgentChat />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
