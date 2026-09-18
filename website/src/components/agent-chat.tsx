"use client";

import { useEffect, useRef, useState } from "react";
import {
  localAgentReply,
  type ChatMessage,
} from "@/lib/agent-brain";
import { cn } from "@/lib/utils";

const STARTERS = [
  "What happens if we crash after WAL fsync?",
  "Builder vs Scale — which should I pick?",
  "Show me the Rust put/get API",
  "Does Spindle fit a session store?",
] as const;

type Msg = { role: "user" | "assistant"; content: string };

export function AgentChat({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "I’m Spindle Agent — Max McCutcheon’s AI for the engine and Cloud. Ask about durability, pricing, APIs, or your workload.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);
    const payload: ChatMessage[] = next.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    try {
      const res = await fetch("/api/agent/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      if (res.ok) {
        const data = (await res.json()) as { reply?: string; mode?: string };
        if (data.reply) {
          setMode(data.mode ?? "api");
          setMessages((m) => [
            ...m,
            { role: "assistant", content: data.reply! },
          ]);
          return;
        }
      }
      await new Promise((r) => setTimeout(r, 200));
      setMode("local");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: localAgentReply(trimmed, payload) },
      ]);
    } catch {
      setMode("local");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: localAgentReply(trimmed, payload) },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden border border-border/80 bg-card/90 shadow-[0_24px_80px_-40px_rgba(7,24,32,0.55)] backdrop-blur-md",
        compact ? "h-[min(70vh,560px)]" : "min-h-[70vh]",
      )}
    >
      <div className="flex items-center justify-between border-b border-border/70 bg-ink px-4 py-3 text-mist">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight">
            Spindle Agent
          </p>
          <p className="text-[11px] text-mist/60">
            by Max McCutcheon ·{" "}
            {mode === "openai"
              ? "GPT connected"
              : mode === "local" || mode === "local-fallback"
                ? "Spindle brain"
                : "Ready"}
          </p>
        </div>
        <span className="rounded-full bg-teal/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-sand">
          Live
        </span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div
            key={`${i}-${m.role}`}
            className={cn(
              "max-w-[92%] whitespace-pre-wrap text-sm leading-relaxed",
              m.role === "user"
                ? "ml-auto rounded-2xl rounded-br-md bg-teal px-4 py-2.5 text-primary-foreground"
                : "mr-auto rounded-2xl rounded-bl-md bg-mist/80 px-4 py-2.5 text-ink",
            )}
          >
            {m.content}
          </div>
        ))}
        {busy ? (
          <div className="mr-auto flex gap-1 rounded-2xl bg-mist/80 px-4 py-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal [animation-delay:120ms]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal [animation-delay:240ms]" />
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {messages.length < 3 ? (
        <div className="flex flex-wrap gap-2 border-t border-border/50 px-4 py-3">
          {STARTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full bg-background px-3 py-1.5 text-left text-xs font-medium text-ink ring-1 ring-border transition hover:ring-teal"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      <form
        className="flex gap-2 border-t border-border/70 bg-background/80 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Spindle Agent…"
          className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm text-ink outline-none ring-teal focus:ring-2"
          disabled={busy}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-xl bg-teal px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-teal-deep disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
