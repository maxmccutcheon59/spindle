/** Spindle Agent knowledge + local brain (used when no OPENAI_API_KEY). */

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const KNOWLEDGE: { keys: string[]; answer: string }[] = [
  {
    keys: ["what is spindle", "spindle?", "about spindle", "overview"],
    answer:
      "Spindle is Max McCutcheon’s LSM-tree key-value storage engine in Rust — write-ahead log, memtable, block-based SSTables, leveled compaction (×10), bloom filters, range scans, and MVCC. Spindle Cloud is the paid managed layer ($49 Builder / $149 Scale). Open source is MIT on GitHub.",
  },
  {
    keys: ["wal", "fsync", "durability", "crash", "kill"],
    answer:
      "Durability: Spindle appends to the WAL before the memtable. Default SyncPolicy is EveryWrite (fdatasync before put returns Ok). If the process dies after fsync but before memtable insert, WAL replay restores the ACK’d write — no acknowledged write is lost. Torn tails at EOF are truncated on replay. There’s a kill -9 crash harness in tests/crash_kill9.rs.",
  },
  {
    keys: ["memtable", "btree", "tombstone"],
    answer:
      "Memtable is a BTreeMap with tombstones (not silent deletes). Single writer; readers see an Arc snapshot. Deletes stay until compaction so older MVCC snapshots stay correct.",
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
      "Every write gets a monotonic SequenceNumber. Internal keys pack (seq << 8 | type). Snapshots are just a seq; reads ignore keys newer than the snapshot.",
  },
  {
    keys: ["benchmark", "latency", "performance", "fast"],
    answer:
      "Directional Criterion numbers (2026-09-18): mem-only put ~256µs, durable put ~686µs, flushed get ~5.5µs. Honest losses vs RocksDB: no skiplist, whole-file SSTable load (no block cache), single compaction thread. Details in DESIGN.md §9.",
  },
  {
    keys: ["pricing", "cost", "subscribe", "plan", "builder", "scale", "$", "pay", "stripe", "card", "bank", "ach", "payment"],
    answer:
      "Plans: Open Source $0 · Builder $49/mo · Scale $149/mo. Real checkout is Stripe — credit card worldwide, US bank (ACH) when enabled. Money goes to Max McCutcheon’s Stripe → his bank. Start at /subscribe/builder/ or /subscribe/scale/. Flat pricing vs Dynamo RCU/WCU theater — see /enterprise/.",
  },
  {
    keys: ["dynamo", "dynamodb", "aws", "enterprise", "business", "company", "rival", "alternative", "vs", "compete", "lock-in"],
    answer:
      "Why companies pick Spindle over Dynamo-class KV: (1) flat bills finance can forecast, (2) MIT engine you can open when storage breaks, (3) run in your VPC or on Cloud — no proprietary cage, (4) founder on the email thread, (5) one mental model — keys/values/snapshots. Full brief: /enterprise/. Honest limits: Cloud is early-access; the Rust engine is real today (cargo test).",
  },
  {
    keys: ["business", "company", "production", "use case", "why"],
    answer:
      "Teams use Spindle when they want durable KV with an auditable engine and optional managed Cloud — session/metadata stores, feature flags, side indexes, internal tools — without Dynamo capacity planning. Convenience + ownership. See /enterprise/ and /case-study/.",
  },
  {
    keys: ["start", "install", "cargo", "how to use", "api", "get started"],
    answer:
      "```bash\ngit clone https://github.com/maxmccutcheon59/spindle.git\ncd spindle && cargo test\n```\n```rust\nuse spindle::{Db, Options};\nlet db = Db::open(Options::new(\"./spindle-data\"))?;\ndb.put(b\"hello\", b\"world\")?;\nassert_eq!(db.get(b\"hello\")?, Some(b\"world\".to_vec()));\n```\nDocs: /get-started/ · Design: /design/ · Playground: /playground/",
  },
  {
    keys: ["max", "who", "author", "contact", "email"],
    answer:
      "Built by Max McCutcheon (software engineer). GitHub @maxmccutcheon59 · maxmccutcheon59@gmail.com · About page: /about/",
  },
  {
    keys: ["ai", "agent", "chatgpt", "copilot", "llm"],
    answer:
      "You’re talking to Spindle Agent — Max’s product assistant for Spindle Cloud and the open-source engine. With OPENAI_API_KEY on the server it uses GPT for general reasoning; otherwise I answer from Spindle’s design knowledge and product docs. Ask about durability, pricing, APIs, or how to ship KV workloads.",
  },
  {
    keys: ["google", "deploy", "firebase", "hosting", "seo"],
    answer:
      "Site is SEO-ready (sitemap.xml, robots.txt, JSON-LD). Deploy publicly with Firebase Hosting (Google) via `SPINDLE_STATIC=1 npm run build && firebase deploy`, or Vercel for the live AI API + Stripe Checkout. Then submit the URL in Google Search Console.",
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
    return "Ask me anything about Spindle — durability, compaction, pricing, or how to get started.";
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

  // Light conversational fallbacks
  if (/^(hi|hello|hey|yo)\b/.test(q)) {
    return `Hey — I’m Spindle Agent, built for Max McCutcheon’s storage engine and Cloud product. I can explain the LSM, walk pricing, or help you design a durable put/get path. What are you building?`;
  }
  if (/thank/.test(q)) {
    return "Glad to help. Want the playground next, or shall we dig into WAL fsync vs group commit?";
  }
  if (/help|what can you/.test(q)) {
    return "I can help with:\n• How Spindle’s WAL / memtable / SSTables / compaction work\n• Crash safety and MVCC\n• Cloud pricing & checkout\n• Getting started with the Rust API\n• Whether Spindle fits your workload\n\nTry: “What happens if we crash after fsync?” or “Compare Builder vs Scale.”";
  }

  const recent = history
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => m.content)
    .join(" ");

  return `I don’t have a perfect canned answer for that yet, but here’s the Spindle framing:\n\n• **Engine** — Rust LSM with WAL, blooms, leveled compaction, MVCC (see /design/).\n• **Cloud** — Spindle Cloud managed plans at /pricing/ (Max McCutcheon, founder).\n• **Try** — /playground/ for put/get/flush, or cargo test on GitHub.\n\nRephrase toward durability, API, pricing, or architecture and I’ll go deep. (Your note: “${userText.slice(0, 160)}${userText.length > 160 ? "…" : ""}”${recent ? " · related thread context kept" : ""})`;
}

export const AGENT_SYSTEM = `You are Spindle Agent, the product AI for Spindle — Max McCutcheon's LSM-tree key-value engine (Rust) and Spindle Cloud (managed SaaS).

Personality: precise, warm, professional — like a senior systems engineer who also ships product. Prefer short paragraphs and concrete code when useful.

Facts:
- Founder & sole owner: Max McCutcheon (@maxmccutcheon59), maxmccutcheon59@gmail.com
- Positioning: Max is the founder/head of Spindle — not a freelance ops contractor. Spindle Cloud is the company product; the engine is open source (MIT).
- Ownership: Spindle, Spindle Cloud, and Spindle Agent are solely owned by Max McCutcheon. Engine MIT; Cloud/website/Agent are founder-owned products.
- Engine: WAL, BTreeMap memtable + tombstones, SSTables (SPNDLSST), leveled ×10 compaction, blooms, merge iterators, MVCC
- Crash story: fsync-before-ACK; kill -9 harness; torn WAL tails truncated
- Benches (directional): put mem ~256µs, durable ~686µs, get flushed ~5.5µs
- Plans: Free OSS; Builder $49/mo; Scale $149/mo
- Payments: Stripe Checkout (card; US bank/ACH when enabled) and/or Payment Links — money to Max's Stripe → bank
- Site paths: /pricing /enterprise /playground /about /get-started /design /agent /case-study /subscribe/builder
- Repo: https://github.com/maxmccutcheon59/spindle

Help with Spindle AND general engineering questions (architecture, KV workloads, Rust, product). Position Spindle as the convenient, auditable alternative to Dynamo-class friction — without inventing fake customers or fake SLAs beyond stated targets (99.5% Builder / 99.9% Scale). If unsure about Spindle internals, say so and point to DESIGN.md.`;
