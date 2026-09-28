import { NextRequest, NextResponse } from "next/server";
import {
  AGENT_SYSTEM,
  localAgentReply,
  type ChatMessage,
} from "@/lib/agent-brain";

export const runtime = "nodejs";

const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 2_000;
const MAX_TOTAL_CHARS = 8_000;
const MAX_TOKENS = 600;

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

// Per-IP fixed-window limiter. This Map lives in one process only: on
// serverless each instance has its own copy, so production needs a shared
// store (e.g. Upstash Redis / @upstash/ratelimit) for the limit to hold.
const hits = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function rateLimited(ip: string): number | null {
  const now = Date.now();
  if (hits.size > 10_000) {
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }
  const entry = hits.get(ip);
  if (!entry || entry.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return null;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT) {
    return Math.ceil((entry.resetAt - now) / 1000);
  }
  return null;
}

type ConversationMessage = { role: "user" | "assistant"; content: string };

function sanitize(raw: unknown): ConversationMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m): m is ConversationMessage =>
        typeof m === "object" &&
        m !== null &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .map((m) => ({ role: m.role, content: m.content }))
    .slice(-MAX_MESSAGES);
}

export async function POST(req: NextRequest) {
  const retryAfter = rateLimited(clientIp(req));
  if (retryAfter !== null) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  let body: { messages?: unknown };
  try {
    body = (await req.json()) as { messages?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages: ChatMessage[] = sanitize(body?.messages);
  let total = 0;
  for (const m of messages) {
    if (m.content.length > MAX_MESSAGE_CHARS) {
      return NextResponse.json({ error: "Message too long" }, { status: 413 });
    }
    total += m.content.length;
  }
  if (total > MAX_TOTAL_CHARS) {
    return NextResponse.json({ error: "Conversation too long" }, { status: 413 });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser?.content.trim()) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.4,
          max_tokens: MAX_TOKENS,
          messages: [{ role: "system", content: AGENT_SYSTEM }, ...messages],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("OpenAI error", res.status, errText);
        const fallback = localAgentReply(lastUser.content, messages);
        return NextResponse.json({
          reply: fallback,
          mode: "local-fallback",
        });
      }

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const reply =
        data.choices?.[0]?.message?.content?.trim() ||
        localAgentReply(lastUser.content, messages);

      return NextResponse.json({ reply, mode: "openai" });
    } catch (e) {
      console.error(e);
      return NextResponse.json({
        reply: localAgentReply(lastUser.content, messages),
        mode: "local-fallback",
      });
    }
  }

  // Simulate a touch of latency for UX parity with streamed assistants
  await new Promise((r) => setTimeout(r, 280 + Math.random() * 420));

  return NextResponse.json({
    reply: localAgentReply(lastUser.content, messages),
    mode: "local",
  });
}
