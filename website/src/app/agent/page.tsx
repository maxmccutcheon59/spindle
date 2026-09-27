import type { Metadata } from "next";
import { AgentChat } from "@/components/agent-chat";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Spindle Agent",
  description: `Spindle Agent — a small on-site assistant for ${site.author.name}'s Rust LSM. Local replies by default; GPT only if you set OPENAI_API_KEY on a server you run.`,
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
          A small assistant for the Rust engine: durability, the API, and what
          the website does and does not ship. Replies come from a local script
          unless you run the server with{" "}
          <code className="font-mono text-sm">OPENAI_API_KEY</code>. GitHub
          Pages does not host that API. This is not a support channel for a
          hosted database.
        </p>
        <div className="mt-8">
          <AgentChat />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
