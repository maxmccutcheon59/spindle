"use client";

import { useState } from "react";
import Link from "next/link";
import { AgentChat } from "@/components/agent-chat";

export function AgentFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close Spindle Agent" : "Open Spindle Agent"}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-teal text-lg font-bold text-primary-foreground shadow-[0_16px_40px_-12px_rgba(15,122,122,0.8)] transition hover:-translate-y-0.5 hover:bg-teal-deep md:bottom-8 md:right-8"
      >
        {open ? "×" : "AI"}
      </button>

      {open ? (
        <div className="fixed bottom-24 right-4 z-40 w-[min(100vw-2rem,420px)] md:right-8">
          <AgentChat compact />
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Full screen:{" "}
            <Link href="/agent/" className="font-semibold text-teal-deep underline-offset-2 hover:underline">
              /agent
            </Link>
          </p>
        </div>
      ) : null}
    </>
  );
}
