import { NextRequest, NextResponse } from "next/server";
import {
  AGENT_SYSTEM,
  localAgentReply,
  type ChatMessage,
} from "@/lib/agent-brain";

export const runtime = "nodejs";

type Body = {
  messages: ChatMessage[];
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser?.content?.trim()) {
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
          messages: [
            { role: "system", content: AGENT_SYSTEM },
            ...messages
              .filter((m) => m.role === "user" || m.role === "assistant")
              .slice(-16)
              .map((m) => ({ role: m.role, content: m.content })),
          ],
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
