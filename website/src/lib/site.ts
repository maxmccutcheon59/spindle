export const site = {
  name: "Spindle",
  product: "Spindle Cloud",
  tagline: "The convenient KV cloud companies can actually own",
  description:
    "Spindle is Max McCutcheon’s LSM-tree key-value engine and Spindle Cloud — flat-priced, open-source-underneath durable storage for businesses that refuse DynamoDB’s capacity theater, lock-in, and black-box ops.",
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
    email: "maxmccutcheon59@gmail.com",
    github: "https://github.com/maxmccutcheon59",
    bio: "Founder of Spindle. I build storage companies can defend — durable puts, readable engines, and Cloud convenience without hyperscaler lock-in.",
  },
  ownership:
    "Spindle, Spindle Cloud, and Spindle Agent are founded and solely owned by Max McCutcheon (maxmccutcheon59@gmail.com). Until a formal company entity is registered, all rights, trademarks-in-use, Cloud product, website, branding, and Agent remain with the founder personally. The open-source engine is MIT-licensed; Cloud and Agent are proprietary company assets of the founder and may be assigned to a future LLC/Corp Max forms.",
  keywords: [
    "Spindle",
    "Spindle Cloud",
    "Max McCutcheon",
    "DynamoDB alternative",
    "DynamoDB competitor",
    "managed key-value store",
    "predictable database pricing",
    "open source KV",
    "LSM tree Rust",
    "enterprise key-value",
  ],
} as const;

export type PlanId = "builder" | "scale";

export const plans = [
  {
    id: "free" as const,
    name: "Open Source",
    price: "$0",
    period: "forever",
    blurb:
      "Run Spindle in your VPC or on bare metal. Full MIT source. Zero AWS tax, zero lock-in insurance.",
    features: [
      "MIT-licensed Rust LSM engine",
      "WAL, SSTables, leveled compaction",
      "kill -9 crash tests in CI",
      "Embed in your product — take it with you",
    ],
    cta: "View on GitHub",
    href: "https://github.com/maxmccutcheon59/spindle",
    external: true,
    highlighted: false,
  },
  {
    id: "builder" as const,
    name: "Builder",
    price: "$49",
    period: "/ month",
    blurb:
      "One flat bill. No RCU/WCU spreadsheets. Ship staging KV in an afternoon — the convenience Dynamo never gave finance.",
    features: [
      "25 GB durable storage",
      "Daily snapshots",
      "Single-region Cloud endpoint",
      "Founder-reachable support · 99.5% target",
      "Cancel anytime — no reserved capacity",
    ],
    cta: "Start Builder",
    href: "/subscribe/builder/",
    external: false,
    highlighted: true,
  },
  {
    id: "scale" as const,
    name: "Scale",
    price: "$149",
    period: "/ month",
    blurb:
      "Predictable production pricing for companies that outgrew toy KV and refuse invoice roulette.",
    features: [
      "250 GB durable storage",
      "Point-in-time recovery (7 days)",
      "Priority founder support · 99.9% target",
      "Usage dashboards & audit log",
      "Same open engine under the hood",
    ],
    cta: "Start Scale",
    href: "/subscribe/scale/",
    external: false,
    highlighted: false,
  },
] as const;

export const benches = [
  {
    name: "Mem-only put",
    value: "256 µs",
    detail: "Group-commit window, rarely fsyncs",
  },
  {
    name: "Durable put",
    value: "686 µs",
    detail: "fdatasync after every WAL append",
  },
  {
    name: "Flushed get",
    value: "5.5 µs",
    detail: "10k keys, one SSTable + bloom",
  },
] as const;

export const stack = [
  {
    title: "Memtable",
    body: "BTreeMap with tombstones. Readers see an Arc snapshot; deletes never silently vanish under MVCC.",
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

/** Why companies pick Spindle over Dynamo-class clouds */
export const enterpriseWins = [
  {
    title: "No capacity theater",
    body: "DynamoDB forces RCUs, WCUs, on-demand mode, reserved capacity, and FinOps archaeology. Spindle Cloud is a flat monthly plan — put, get, scan. Finance forecasts one line. Engineering ships without a capacity committee.",
  },
  {
    title: "Convenience that still opens",
    body: "Black-box stores fail opaquely — then your pager wakes a team that can’t read the code. Spindle’s engine is MIT on GitHub. Your staff (or ours) can walk the WAL path, the bloom, the compaction. Managed ease with an audit trail.",
  },
  {
    title: "Portability is the product",
    body: "Hyperscaler KV traps you in proprietary APIs and region gravity. Embed Spindle’s crate, run on your metal, or subscribe to Cloud. Same mental model. Leave when you want — the engine comes with you.",
  },
  {
    title: "Founder on the thread, not ticket roulette",
    body: "Enterprise AWS support is a queue with severity codes. With Spindle you email maxmccutcheon59@gmail.com and talk to the person who wrote the fsync policy. Big companies pay for that clarity.",
  },
  {
    title: "Onboarding in hours, not console tourism",
    body: "No IAM maze, no capacity class bingo, no twelve Dynamo feature footnotes to explain a put. Endpoint + Agent + docs. New hires touch storage on day one.",
  },
  {
    title: "One mental model your org can defend",
    body: "Keys, values, sequences, snapshots. Security and platform teams get DESIGN.md, crash tests, and source — not a PDF that says “trust the region.” That’s why enterprises rely on Spindle for KV that must stay explainable.",
  },
] as const;

export const vsCloud = [
  {
    them: "DynamoDB / peers",
    us: "Spindle Cloud",
    rows: [
      {
        label: "Pricing",
        them: "Usage meters, reserved capacity, surprise bills",
        us: "Flat $49 / $149 — CFO-readable",
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
        us: "Endpoint + Agent + one model",
      },
      {
        label: "Procurement",
        them: "Commitments, reserved capacity, SKUs",
        us: "Subscribe, cancel, no theater",
      },
    ],
  },
] as const;

export const saasPromises = [
  {
    title: "Convenience without the cage",
    body: "Managed durability and a simple API — without surrendering your stack to a proprietary store you can’t relocate when strategy changes.",
  },
  {
    title: "Bills your CFO can read",
    body: "Subscription lines beat decoding RU/WU graphs in a FinOps meeting. Scale when you need more bytes, not more jargon.",
  },
  {
    title: "Engine enterprises can audit",
    body: "Security and platform teams get source, crash tests, and a design doc — not a compliance PDF that says “trust us.”",
  },
] as const;

/** Business reasons — short bullets for pricing / enterprise CTAs */
export const businessReasons = [
  {
    title: "Forecastable spend",
    body: "Replace capacity planning meetings with a subscription your finance team can model.",
  },
  {
    title: "Escape hatch built in",
    body: "Open-source core means you’re never hostage to one vendor’s API or pricing flip.",
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
  { label: "Email", value: "maxmccutcheon59@gmail.com" },
] as const;
