/** Spindle Agent knowledge + local brain (used when no OPENAI_API_KEY). */

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const KNOWLEDGE: { keys: string[]; answer: string }[] = [
  {
    keys: ["what is spindle", "spindle?", "about spindle", "overview"],
    answer:
      "Spindle is Max McCutcheon’s LSM-tree key-value storage engine in Rust — write-ahead log, memtable, block-based SSTables, leveled compaction (×10), bloom filters, range scans, and MVCC. That engine is real (MIT on GitHub, cargo test). Spindle Cloud is an idea for a managed layer on top — not built, not for sale; there is a waitlist at /cloud/.",
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
      "Directional Criterion numbers (documented in DESIGN.md): mem-only put ~256µs, durable put ~686µs, flushed get ~5.5µs. Honest losses vs RocksDB: no skiplist, whole-file SSTable load (no block cache), single compaction thread. Details in DESIGN.md §9.",
  },
  {
    keys: ["pricing", "cost", "subscribe", "plan", "builder", "scale", "$", "pay", "stripe", "card", "bank", "ach", "payment"],
    answer:
      "The engine is free and MIT-licensed. Spindle Cloud has no price and nothing is for sale — it isn't built. If you'd use a managed version, join the waitlist at /cloud/ (it emails MaxMcCutcheon1@outlook.com).",
  },
  {
    keys: ["dynamo", "dynamodb", "aws", "enterprise", "business", "company", "rival", "alternative", "vs", "compete", "lock-in"],
    answer:
      "Why teams evaluate Spindle vs Dynamo-class KV: (1) MIT engine you can open when storage breaks — true today, (2) flat-bill Cloud hypothesis for when hosted ships, (3) run in your VPC — no proprietary cage, (4) founder on the email thread, (5) one mental model — keys/values/snapshots. Full brief: /enterprise/. Honest limits: no claim that enterprises already rely on Spindle; Cloud is roadmap; the Rust engine is real (cargo test).",
  },
  {
    keys: ["business", "company", "production", "use case", "why"],
    answer:
      "Teams look at Spindle when they want durable KV with an auditable engine — session/metadata stores, feature flags, side indexes, internal tools — without Dynamo capacity planning. Self-host the crate today; email Max about Cloud early access. See /enterprise/ and /case-study/.",
  },
  {
    keys: ["start", "install", "cargo", "how to use", "api", "get started"],
    answer:
      "```bash\ngit clone https://github.com/maxmccutcheon59/spindle.git\ncd spindle && cargo test\n```\n```rust\nuse spindle::{Db, Options};\nlet db = Db::open(Options::new(\"./spindle-data\"))?;\ndb.put(b\"hello\", b\"world\")?;\nassert_eq!(db.get(b\"hello\")?, Some(b\"world\".to_vec()));\n```\nDocs: /get-started/ · Design: /design/ · Playground: /playground/",
  },
  {
    keys: ["max", "who", "author", "contact", "email"],
    answer:
      "Built by Max McCutcheon (software engineer / founder). GitHub @maxmccutcheon59 · preferred CTA email MaxMcCutcheon1@outlook.com · ownership/legal note email maxmccutcheon59@gmail.com · About: /about/",
  },
  {
    keys: ["cloud", "hosted", "saas", "live", "production cloud", "endpoint"],
    answer:
      "Spindle Cloud hosted durability is not a live billed multi-tenant product yet — no public Cloud API endpoint, no shipped PITR/dashboards/uptime SLA. Website + Agent brain + playground are public. Join the waitlist at /cloud/ if you'd use it.",
  },
  {
    keys: ["ai", "agent", "chatgpt", "copilot", "llm"],
    answer:
      "You’re talking to Spindle Agent — Max’s product assistant for the open-source engine and Cloud roadmap. With OPENAI_API_KEY on a Next.js server it uses GPT; on static GitHub Pages I answer from Spindle’s design knowledge. I don’t invent customers, ARR, or live Cloud SLAs.",
  },
  {
    keys: ["google", "deploy", "firebase", "hosting", "seo"],
    answer:
      "Site is SEO-ready (sitemap.xml, robots.txt, JSON-LD). Public deploy today is GitHub Pages (static). Vercel (or similar) is needed for live /api/checkout + GPT Agent. Firebase Hosting also works for static export. See website/SETUP.md.",
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
    return "Ask me anything about Spindle — durability, compaction, the Cloud waitlist, or how to get started.";
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
    return `Hey — I’m Spindle Agent, built for Max McCutcheon’s storage engine and Cloud roadmap. I can explain the LSM, explain the Cloud waitlist, or help you design a durable put/get path. What are you building?`;
  }
  if (/thank/.test(q)) {
    return "Glad to help. Want the playground next, or shall we dig into WAL fsync vs group commit?";
  }
  if (/help|what can you/.test(q)) {
    return "I can help with:\n• How Spindle’s WAL / memtable / SSTables / compaction work\n• Crash safety and MVCC\n• Spindle Cloud status (not built — waitlist)\n• Getting started with the Rust API\n• Whether Spindle fits your workload\n\nTry: “What happens if we crash after fsync?” or “Is Cloud live?”";
  }

  const recent = history
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => m.content)
    .join(" ");

  return `I don’t have a perfect canned answer for that yet, but here’s the Spindle framing:\n\n• **Engine** — Rust LSM with WAL, blooms, leveled compaction, MVCC (see /design/) — real today.\n• **Cloud** — not built; waitlist at /cloud/.\n• **Try** — /playground/ for put/get/flush, or cargo test on GitHub.\n\nRephrase toward durability, API, Cloud, or architecture and I’ll go deep. (Your note: “${userText.slice(0, 160)}${userText.length > 160 ? "…" : ""}”${recent ? " · related thread context kept" : ""})`;
}

export const AGENT_SYSTEM = `You are Spindle Agent, the product AI for Spindle — Max McCutcheon's LSM-tree key-value engine (Rust) and Spindle Cloud (managed SaaS roadmap).

Personality: precise, warm, professional — like a senior systems engineer who also ships product. Prefer short paragraphs and concrete code when useful.

Facts:
- Founder & sole owner: Max McCutcheon (@maxmccutcheon59)
- Preferred CTA email: MaxMcCutcheon1@outlook.com · ownership/legal note email: maxmccutcheon59@gmail.com
- Positioning: Max is the founder of Spindle. The engine is open source (MIT) and real today. Spindle Cloud hosted durability is NOT a live multi-tenant billed product yet.
- Ownership: Spindle, Spindle Cloud, and Spindle Agent are solely owned by Max McCutcheon. Engine MIT; Cloud/website/Agent are founder-owned products.
- Engine: WAL, BTreeMap memtable + tombstones, SSTables (SPNDLSST), leveled ×10 compaction, blooms, merge iterators, MVCC
- Crash story: fsync-before-ACK; kill -9 harness; torn WAL tails truncated
- Benches (directional, DESIGN.md): put mem ~256µs, durable ~686µs, get flushed ~5.5µs
- Cloud: not built, no pricing, nothing for sale. Interested users join the waitlist at /cloud/ (an email to the founder). PITR, dashboards, storage quotas, and uptime targets are goals, not claims.
- Site paths: /cloud /enterprise /playground /about /get-started /design /agent /case-study
- Repo: https://github.com/maxmccutcheon59/spindle

Help with Spindle AND general engineering questions (architecture, KV workloads, Rust, product). Position Spindle as the convenient, auditable alternative to Dynamo-class friction — WITHOUT inventing fake customers, ARR, logos, waitlist sign-ups, or live SLAs. If unsure about Spindle internals, say so and point to DESIGN.md.`;
