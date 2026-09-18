"use client";

import { useMemo, useState } from "react";

type Entry = { value: string; seq: number; deleted?: boolean };

export function Playground() {
  const [store, setStore] = useState<Record<string, Entry>>({
    hello: { value: "world", seq: 1 },
  });
  const [seq, setSeq] = useState(2);
  const [key, setKey] = useState("hello");
  const [value, setValue] = useState("world");
  const [log, setLog] = useState<string[]>([
    "opened memtable · seq=1 · put hello → world",
  ]);

  const rows = useMemo(
    () =>
      Object.entries(store)
        .filter(([, e]) => !e.deleted)
        .sort(([a], [b]) => a.localeCompare(b)),
    [store],
  );

  function pushLog(line: string) {
    setLog((prev) => [line, ...prev].slice(0, 8));
  }

  function put() {
    const k = key.trim();
    if (!k) return;
    const s = seq;
    setStore((prev) => ({ ...prev, [k]: { value, seq: s } }));
    setSeq(s + 1);
    pushLog(
      `put ${k} → ${JSON.stringify(value)} · seq=${s} · wal append + memtable`,
    );
  }

  function get() {
    const k = key.trim();
    const e = store[k];
    if (!e || e.deleted) {
      pushLog(`get ${k} → None · bloom miss / tombstone`);
      return;
    }
    pushLog(`get ${k} → ${JSON.stringify(e.value)} · seq=${e.seq}`);
  }

  function del() {
    const k = key.trim();
    if (!k) return;
    const s = seq;
    setStore((prev) => ({
      ...prev,
      [k]: { value: "", seq: s, deleted: true },
    }));
    setSeq(s + 1);
    pushLog(`delete ${k} · seq=${s} · tombstone written`);
  }

  function flush() {
    const live = Object.keys(store).filter((k) => !store[k].deleted).length;
    pushLog(
      `flush → L0 SSTable · ${live} keys · footer SPNDLSST · bloom bits_per_key=10`,
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <div className="flex flex-wrap gap-2 border border-border/80 bg-card/80 p-4">
          <label className="flex min-w-[8rem] flex-1 flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Key
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm font-normal normal-case tracking-normal text-ink outline-none ring-teal focus:ring-2"
            />
          </label>
          <label className="flex min-w-[8rem] flex-1 flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Value
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm font-normal normal-case tracking-normal text-ink outline-none ring-teal focus:ring-2"
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={put}
            className="rounded-md bg-teal px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-teal-deep"
          >
            put
          </button>
          <button
            type="button"
            onClick={get}
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-mist hover:bg-ink/90"
          >
            get
          </button>
          <button
            type="button"
            onClick={del}
            className="rounded-md px-4 py-2 text-sm font-semibold text-ink ring-1 ring-ink/20 hover:bg-ink/5"
          >
            delete
          </button>
          <button
            type="button"
            onClick={flush}
            className="rounded-md px-4 py-2 text-sm font-semibold text-teal-deep ring-1 ring-teal/40 hover:bg-teal/10"
          >
            flush → L0
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Browser demo of Max’s API shape — not the Rust engine. Seq{" "}
          <span className="font-mono text-ink">{seq}</span> · live keys{" "}
          <span className="font-mono text-ink">{rows.length}</span>
        </p>
      </div>
      <div className="space-y-4">
        <div className="border border-border/80 bg-ink p-4 text-mist">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sand">
            Memtable
          </p>
          <ul className="mt-3 max-h-40 space-y-1 overflow-auto font-mono text-xs">
            {rows.length === 0 ? (
              <li className="text-mist/50">(empty)</li>
            ) : (
              rows.map(([k, e]) => (
                <li key={k}>
                  <span className="text-teal">{k}</span> → {e.value}{" "}
                  <span className="text-mist/45">#{e.seq}</span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="border border-border/80 bg-card/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-deep">
            WAL / ops log
          </p>
          <ul className="mt-3 max-h-40 space-y-1.5 overflow-auto font-mono text-xs text-muted-foreground">
            {log.map((line, i) => (
              <li key={`${line}-${i}`}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
