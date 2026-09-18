import type { Metadata } from "next";
import { AgentChat } from "@/components/agent-chat";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Spindle Agent",
  description: `Spindle Agent — ${site.author.name}'s AI for durable KV design, Cloud pricing, and the Rust LSM engine. ChatGPT-style assistant for Spindle.`,
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
          Your co-pilot for Max&apos;s engine and Cloud — durability questions,
          pricing, APIs, and workload fit. Add{" "}
          <code className="font-mono text-sm">OPENAI_API_KEY</code> on the
          server for GPT-backed answers; otherwise the Spindle brain stays on.
        </p>
        <div className="mt-8">
          <AgentChat />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
