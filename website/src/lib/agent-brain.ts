/** Spindle Agent knowledge + local brain (used when no OPENAI_API_KEY). */

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const KNOWLEDGE: { keys: string[]; answer: string }[] = [
  {
    keys: ["what is spindle", "spindle?", "about spindle", "overview"],
    answer:
      "Spindle is Max McCutcheon’s LSM-tree key-value storage engine in Rust — write-ahead log, memtable, block-based SSTables, leveled compaction (×10), bloom filters, range scans, and MVCC. It is MIT-licensed on GitHub; clone it and run cargo test.",
  },
  {
    keys: ["wal", "fsync", "durability", "crash", "kill"],
    answer:
      "Durability: Spindle appends to the WAL before the memtable. Default SyncPolicy is EveryWrite (fdatasync before put returns Ok). If the process dies after fsync but before memtable insert, WAL replay restores the ACK’d write — no acknowledged write is lost. Torn tails at EOF are truncated on replay. There’s a kill -9 crash harness in tests/crash_kill9.rs.",
  },
  {
    keys: ["memtable", "btree", "tombstone"],
    answer:
      "Memtable is a BTreeMap with tombstones (not silent deletes) behind a reader-writer lock; a single writer holds it only for one insert. Deletes stay until compaction so older MVCC snapshots stay correct.",
  },
  {
    keys: ["sstable", "bloom", "footer", "format"],
    answer:
      "SSTables are LevelDB-shaped: data blocks → bloom meta → index → 48-byte footer with magic SPNDLSST. Sparse index, restart-interval prefix compression, CRC. Blooms use Kirsch–Mitzenmacher double hash at bits_per_key=10.",
  },
  {
    keys: ["compaction", "level", "amplification"],
    answer:
      "Leveled compaction on a background thread. Triggers: L0 file count ≥ 4, or level bytes over level_base_bytes * 10^(L-1). ×10 size ratio ≈ LevelDB write amp. Tombstones drop only at the bottom level.",
  },
  {
    keys: ["mvcc", "snapshot", "sequence"],
    answer:
      "Every write gets a monotonic SequenceNumber. Internal keys pack (seq << 8 | type). A snapshot is a seq plus a registration, so compaction keeps whatever it can see; reads ignore keys newer than the snapshot.",
  },
  {
    keys: ["benchmark", "latency", "performance", "fast"],
    answer:
      "Directional Criterion numbers from one recorded run (4 vCPU cloud VM, see DESIGN.md §9): mem-only put ~1.4µs, durable put ~125µs (fsync-bound, varies most by disk), flushed get ~7.2µs. Honest losses vs RocksDB: no skiplist, whole-file SSTable load (no block cache), single compaction thread. Details in DESIGN.md §9.",
  },
  {
    keys: ["start", "install", "cargo", "how to use", "api", "get started"],
    answer:
      "```bash\ngit clone https://github.com/maxmccutcheon59/spindle.git\ncd spindle && cargo test\n```\n```rust\nuse spindle::{Db, Options};\nlet db = Db::open(Options::new(\"./spindle-data\"))?;\ndb.put(b\"hello\", b\"world\")?;\nassert_eq!(db.get(b\"hello\")?, Some(b\"world\".to_vec()));\n```\nDocs: /get-started/ · Design: /design/ · Playground: /playground/",
  },
  {
    keys: ["max", "who", "author", "contact", "email"],
    answer:
      "Built by Max McCutcheon, a CS student at James Madison University. GitHub @maxmccutcheon59 · email MaxMcCutcheon1@outlook.com · About: /about/",
  },
  {
    keys: ["ai", "agent", "chatgpt", "copilot", "llm"],
    answer:
      "You’re talking to Spindle Agent, a small assistant for the open-source engine. With OPENAI_API_KEY on a Next.js server it uses GPT; on static GitHub Pages I answer from a local knowledge base built from DESIGN.md.",
  },
  {
    keys: ["google", "deploy", "firebase", "hosting", "seo"],
    answer:
      "Site is SEO-ready (sitemap.xml, robots.txt, JSON-LD). Public deploy today is GitHub Pages (static). Vercel (or similar) is needed for the GPT-backed Agent. Firebase Hosting also works for static export. See website/SETUP.md.",
  },
];

function score(q: string, keys: string[]): number {
  let s = 0;
  for (const k of keys) {
    if (q.includes(k)) s += k.length;
  }
  return s;
}

export function localAgentReply(userText: string, history: ChatMessage[]): string {
  const q = userText.toLowerCase().trim();
  if (!q) {
    return "Ask me anything about Spindle — durability, compaction, MVCC, or how to get started.";
  }

  let best = KNOWLEDGE[0];
  let bestScore = -1;
  for (const item of KNOWLEDGE) {
    const s = score(q, item.keys);
    if (s > bestScore) {
      bestScore = s;
      best = item;
    }
  }

  if (bestScore > 0) {
    return best.answer;
  }

  if (/^(hi|hello|hey|yo)\b/.test(q)) {
    return `Hey — I’m Spindle Agent, built for Max McCutcheon’s storage engine. I can explain the LSM, its crash safety, or the Rust API. What would you like to know?`;
  }
  if (/thank/.test(q)) {
    return "Glad to help. Want the playground next, or shall we dig into WAL fsync vs group commit?";
  }
  if (/help|what can you/.test(q)) {
    return "I can help with:\n• How Spindle’s WAL / memtable / SSTables / compaction work\n• Crash safety and MVCC\n• Getting started with the Rust API\n\nTry: “What happens if we crash after fsync?” or “How does compaction work?”";
  }

  const recent = history
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => m.content)
    .join(" ");

  return `I don’t have a perfect canned answer for that yet, but here’s the Spindle framing:\n\n• **Engine** — Rust LSM with WAL, blooms, leveled compaction, MVCC (see /design/) — real today.\n• **Try** — /playground/ for put/get/flush, or cargo test on GitHub.\n\nRephrase toward durability, API, or architecture and I’ll go deep. (Your note: “${userText.slice(0, 160)}${userText.length > 160 ? "…" : ""}”${recent ? " · related thread context kept" : ""})`;
}

export const AGENT_SYSTEM = `You are Spindle Agent, an assistant for Spindle — Max McCutcheon's LSM-tree key-value engine in Rust (MIT, open source).

Personality: precise, warm, professional — like a senior systems engineer. Prefer short paragraphs and concrete code when useful.

Facts:
- Author: Max McCutcheon (@maxmccutcheon59), CS student at James Madison University · email MaxMcCutcheon1@outlook.com
- Engine: WAL, BTreeMap memtable + tombstones, SSTables (SPNDLSST), leveled ×10 compaction, blooms, merge iterators, MVCC
- Crash story: fsync-before-ACK; kill -9 harness; torn WAL tails truncated before new appends
- Benchmarks: directional Criterion medians in DESIGN.md §9 (machine and commit recorded there)
- Spindle is a library, not a hosted service. There is no paid product, pricing, or customers.
- Site paths: /playground /about /get-started /design /agent
- Repo: https://github.com/maxmccutcheon59/spindle

Help with Spindle and general storage-engine questions. Never invent customers, users, benchmarks, or features. If unsure about Spindle internals, say so and point to DESIGN.md.`;
