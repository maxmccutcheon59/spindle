export const site = {
  name: "Spindle",
  product: "Spindle Cloud",
  tagline: "An open Rust LSM you can audit — Cloud is the roadmap",
  description:
    "Spindle is Max McCutcheon’s MIT-licensed Rust LSM-tree key-value engine (WAL, SSTables, leveled compaction, MVCC). Spindle Cloud is an idea for managed hosting — not built and not for sale; there is a waitlist.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://maxmccutcheon59.github.io/spindle",
  github: "https://github.com/maxmccutcheon59/spindle",
  design:
    "https://github.com/maxmccutcheon59/spindle/blob/main/DESIGN.md",
  author: {
    name: "Max McCutcheon",
    handle: "maxmccutcheon59",
    role: "Founder",
    /** Preferred public / venture CTA inbox */
    email: "MaxMcCutcheon1@outlook.com",
    /** Email used in ownership / legal notes today (do not silently drop) */
    ownershipEmail: "maxmccutcheon59@gmail.com",
    github: "https://github.com/maxmccutcheon59",
    bio: "Founder of Spindle. I build readable storage engines — durable puts, crash tests, and an honest Cloud roadmap without hyperscaler lock-in theater.",
  },
  ownership:
    "Spindle, Spindle Cloud, and Spindle Agent are founded and solely owned by Max McCutcheon (legal/ownership contact: maxmccutcheon59@gmail.com; venture CTAs: MaxMcCutcheon1@outlook.com). Until a formal company entity is registered, all rights, trademarks-in-use, Cloud product, website, branding, and Agent remain with the founder personally. The open-source engine is MIT-licensed; Cloud and Agent are proprietary assets of the founder and may be assigned to a future LLC/Corp Max forms. Spindle Cloud is not a live product; there is a waitlist and nothing is for sale.",
  keywords: [
    "Spindle",
    "Spindle Cloud",
    "Max McCutcheon",
    "LSM tree Rust",
    "open source KV",
    "key-value store",
    "WAL SSTable",
    "DynamoDB alternative",
  ],
} as const;

/** Cloud waitlist: a pre-filled email (the site is static, so no form backend). */
export const waitlistHref = `mailto:${site.author.email}?subject=${encodeURIComponent(
  "Spindle Cloud waitlist",
)}&body=${encodeURIComponent(
  "Hi Max,\n\nPlease add me to the Spindle Cloud waitlist.\n\nWhat I'd store / workload:\n",
)}`;

export const benches = [
  {
    name: "Mem-only put",
    value: "1.9 µs",
    detail: "Group-commit window, rarely fsyncs",
  },
  {
    name: "Durable put",
    value: "238 µs",
    detail: "fdatasync after every WAL append (disk-bound)",
  },
  {
    name: "Flushed get",
    value: "8.0 µs",
    detail: "10k keys, one SSTable + bloom",
  },
] as const;

export const stack = [
  {
    title: "Memtable",
    body: "BTreeMap with tombstones behind a reader-writer lock. Writers hold it for one insert; deletes never silently vanish under MVCC.",
  },
  {
    title: "Write-ahead log",
    body: "Append before memtable. EveryWrite or group-commit fsync — acknowledged writes survive kill -9.",
  },
  {
    title: "SSTables",
    body: "Block-based tables with sparse index, CRC, footer magic SPNDLSST, and per-table bloom filters.",
  },
  {
    title: "Leveled compaction",
    body: "Background ×10 size ratio. Bounds read amp and file count the LevelDB way.",
  },
  {
    title: "Merge iterators",
    body: "Min-heap over memtables and SSTables for correct range scans at a snapshot sequence.",
  },
  {
    title: "MVCC snapshots",
    body: "Monotonic sequence numbers packed into internal keys. Snapshots ignore newer writes.",
  },
] as const;

/** Why the engine + Cloud hypothesis matter — aspirational positioning, not traction claims */
export const enterpriseWins = [
  {
    title: "No capacity theater (hypothesis)",
    body: "DynamoDB forces RCUs, WCUs, on-demand mode, reserved capacity, and FinOps archaeology. Spindle Cloud’s bet is one flat monthly plan — put, get, scan — if hosted durability ships. Finance forecasts one line. Engineering ships without a capacity committee.",
  },
  {
    title: "An engine you can open today",
    body: "Black-box stores fail opaquely — then your pager wakes a team that can’t read the code. Spindle’s engine is MIT on GitHub now. You can walk the WAL path, the bloom, the compaction. Managed Cloud is the roadmap on top of that audit trail.",
  },
  {
    title: "Portability is the product",
    body: "Hyperscaler KV traps you in proprietary APIs and region gravity. Embed Spindle’s crate or run on your metal today. Cloud is optional later — same mental model. Leave when you want — the engine comes with you.",
  },
  {
    title: "Founder on the thread, not ticket roulette",
    body: "Enterprise AWS support is a queue with severity codes. With Spindle you email MaxMcCutcheon1@outlook.com and talk to the person who wrote the fsync policy. That clarity is the support model — not a claim that enterprises already rely on Spindle.",
  },
  {
    title: "Onboarding without console tourism",
    body: "No IAM maze or capacity class bingo to try the engine: clone, cargo test, put/get. Cloud endpoints and Agent GPT mode need a hosted deploy — until then, docs + playground + email Max.",
  },
  {
    title: "One mental model you can defend",
    body: "Keys, values, sequences, snapshots. Security and platform teams get DESIGN.md, crash tests, and source — not a PDF that says “trust the region.” That’s the pitch for teams that need explainable KV — not a claim of existing enterprise customers.",
  },
] as const;

export const vsCloud = [
  {
    them: "DynamoDB / peers",
    us: "Spindle (engine today · Cloud roadmap)",
    rows: [
      {
        label: "Pricing",
        them: "Usage meters, reserved capacity, surprise bills",
        us: "OSS free today; Cloud pricing not set (waitlist)",
      },
      {
        label: "Lock-in",
        them: "Proprietary API + region gravity",
        us: "MIT engine you can relocate",
      },
      {
        label: "Debuggability",
        them: "Closed source, opaque failure modes",
        us: "DESIGN.md + readable Rust path",
      },
      {
        label: "Support",
        them: "Enterprise ticket maze",
        us: "Founder on the email thread",
      },
      {
        label: "Onboarding",
        them: "Console + IAM + capacity classes",
        us: "Clone + cargo test · Cloud endpoint later",
      },
      {
        label: "Procurement",
        them: "Commitments, reserved capacity, SKUs",
        us: "Join the Cloud waitlist — nothing to buy yet",
      },
    ],
  },
] as const;

export const saasPromises = [
  {
    title: "Engine you can audit",
    body: "WAL, SSTables, compaction, MVCC — implemented, tested, and documented. The serious part of Spindle ships as MIT source today.",
  },
  {
    title: "Bills finance could model (roadmap)",
    body: "If Cloud ships, the aim is one subscription line instead of RU/WU graphs. Until then, self-host the engine at $0.",
  },
  {
    title: "Convenience without the cage (hypothesis)",
    body: "Managed durability is the company product direction — not a claim that multi-tenant hosting, PITR, or dashboards are live. Embed or self-host now; join the waitlist to hear about Cloud.",
  },
] as const;

/** Business reasons — short bullets for the Cloud / enterprise pages */
export const businessReasons = [
  {
    title: "Forecastable spend (hypothesis)",
    body: "Cloud aims to replace capacity planning meetings with one subscription finance can model — if hosting ships.",
  },
  {
    title: "Escape hatch built in",
    body: "Open-source core means you’re never hostage to one vendor’s API or pricing flip. True today.",
  },
  {
    title: "Faster incident clarity",
    body: "When storage breaks, you can read the write path — or email the founder who wrote it.",
  },
  {
    title: "Simpler ops surface",
    body: "One KV model. Less training debt. Less console sprawl for every new service.",
  },
] as const;

export const credentials = [
  { label: "Language", value: "Rust 1.85+" },
  { label: "License", value: "MIT © Max" },
  { label: "Founder", value: "Max McCutcheon" },
  { label: "Email", value: "MaxMcCutcheon1@outlook.com" },
] as const;
