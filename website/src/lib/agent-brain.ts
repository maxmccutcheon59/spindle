/** Spindle Agent knowledge + local brain (used when no OPENAI_API_KEY). */

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const KNOWLEDGE: { keys: string[]; answer: string }[] = [
  {
    keys: ["what is spindle", "spindle?", "about spindle", "overview"],
    answer:
      "Spindle is Max McCutcheon’s LSM-tree key-value storage engine in Rust — write-ahead log, memtable, block-based SSTables, leveled compaction (×10), bloom filters, range scans, and MVCC. MIT on GitHub. Cloud, Stripe, and Agent pages are an early-access website experiment: they do not provision a hosted database. Try: cargo run --example quickstart.",
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
      "The engine is free (MIT). $49 and $149 on /pricing/ are proposed early-access figures, not live quotas or SLAs. If Stripe keys are configured, a card can be charged to Max McCutcheon; that does not provision storage. See /enterprise/ and /case-study/.",
  },
  {
    keys: ["dynamo", "dynamodb", "aws", "enterprise", "business", "company", "rival", "alternative", "vs", "compete", "lock-in"],
    answer:
      "Spindle is not a hosted KV product and has no customer base. The real artifact is the MIT Rust LSM (WAL, SSTables, leveled compaction, MVCC, kill -9 tests). Cloud pages are an early-access experiment. Read /enterprise/ and DESIGN.md. Do not treat it as a replacement for an operated database.",
  },
  {
    keys: ["business", "company", "production", "use case", "why"],
    answer:
      "Spindle is a student systems project: an embedded LSM you compile into a process. There is no production tenant list. Sensible reading is the engine, DESIGN.md, and the quickstart example — not a managed-database pitch. Status: /case-study/.",
  },
  {
    keys: ["start", "install", "cargo", "how to use", "api", "get started"],
    answer:
      "```bash\ngit clone https://github.com/maxmccutcheon59/spindle.git\ncd spindle && cargo run --example quickstart\n```\nThat prints put, get, delete, flush, scan, and a reopen. API: Db::open, put, get, delete, flush, scan. Docs: /get-started/ · Design: /design/.",
  },
  {
    keys: ["max", "who", "author", "contact", "email"],
    answer:
      "Built by Max McCutcheon (software engineer). GitHub @maxmccutcheon59 · maxmccutcheon59@gmail.com · About page: /about/",
  },
  {
    keys: ["ai", "agent", "chatgpt", "copilot", "llm"],
    answer:
      "You’re talking to Spindle Agent, a small assistant for Max McCutcheon’s open-source LSM. With OPENAI_API_KEY on a server you run, answers can come from GPT; otherwise I use a local script. I will not invent customers or a hosted database. Ask about the WAL, compaction, or the quickstart.",
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
    return `Hey — I’m Spindle Agent, for Max McCutcheon’s Rust LSM. I can walk the write path, the crash story, or what the website does not ship. What do you want to read?`;
  }
  if (/thank/.test(q)) {
    return "Glad to help. Want the playground next, or shall we dig into WAL fsync vs group commit?";
  }
  if (/help|what can you/.test(q)) {
    return "I can help with:\n• How Spindle’s WAL / memtable / SSTables / compaction work\n• Crash safety and MVCC\n• What the $49 / $149 pages do and do not include\n• cargo run --example quickstart\n\nTry: “What happens if we crash after fsync?”";
  }

  const recent = history
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => m.content)
    .join(" ");

  return `I don’t have a canned answer for that. Here’s the accurate frame:\n\n• **Engine** — Rust LSM with WAL, blooms, leveled compaction, MVCC (see /design/).\n• **Website** — Cloud / Stripe / Agent pages are an early-access experiment. They do not provision storage (/enterprise/).\n• **Try** — cargo run --example quickstart, or /get-started/.\n\nAsk about durability, the API, or what ships. (Your note: “${userText.slice(0, 160)}${userText.length > 160 ? "…" : ""}”${recent ? " · related thread context kept" : ""})`;
}

export const AGENT_SYSTEM = `You are Spindle Agent, a small assistant for Spindle — Max McCutcheon's LSM-tree key-value engine in Rust (MIT, version 0.1.0).

Personality: precise and plain. Prefer short paragraphs and concrete code when useful. Never invent customers, traction, SLAs, or production parity with a hosted database.

Facts:
- Author: Max McCutcheon (@maxmccutcheon59), maxmccutcheon59@gmail.com. No company is registered.
- The hiring artifact is the engine. Cloud, Stripe, and Agent pages are an early-access website experiment.
- Engine: WAL, BTreeMap memtable + tombstones, SSTables (SPNDLSST), leveled ×10 compaction, blooms, merge iterators, MVCC
- Public API: Db::open, put, get, delete, flush, scan, snapshot / get_snapshot / scan_snapshot
- Demo: cargo run --example quickstart
- Crash story: fsync-before-ACK; kill -9 harness; torn WAL tails truncated
- Known limit: compaction drops older versions even if a snapshot might need them
- Benches (directional, 2026-09-18): put mem ~256µs, durable ~686µs, get flushed ~5.5µs
- Prices on the site: $0 engine; $49 and $149 are proposed figures. They do not provision storage or promise uptime.
- Payments: Stripe can charge a card only when keys are configured. A charge does not create a database.
- Playground is an in-browser mock, not the Rust crate.
- Site paths: /get-started /design /playground /about /pricing /enterprise /agent /case-study
- Repo: https://github.com/maxmccutcheon59/spindle

If unsure about internals, say so and point to DESIGN.md.`;
