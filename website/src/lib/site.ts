export const site = {
  name: "Spindle",
  product: "Spindle",
  tagline: "An LSM-tree key-value engine in Rust",
  description:
    "Spindle is Max McCutcheon’s open-source LSM-tree key-value engine in Rust: write-ahead log, SSTables, leveled compaction, and MVCC. Cloud, Stripe, and Agent pages on this site are an early-access experiment, not a hosted database.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://maxmccutcheon59.github.io/spindle",
  github: "https://github.com/maxmccutcheon59/spindle",
  design:
    "https://github.com/maxmccutcheon59/spindle/blob/main/DESIGN.md",
  author: {
    name: "Max McCutcheon",
    handle: "maxmccutcheon59",
    role: "Author",
    email: "maxmccutcheon59@gmail.com",
    github: "https://github.com/maxmccutcheon59",
    bio: "I wrote Spindle, an open-source Rust LSM: WAL fsync policy, SSTables, leveled compaction, and MVCC, with crash tests and design notes. Cloud pages on this site are an early-access experiment beside that engine.",
  },
  ownership:
    "The MIT engine and this website are maintained by Max McCutcheon (maxmccutcheon59@gmail.com). No company is registered. Cloud, Stripe, and Agent pages are experimental notes, not a hosted service.",
  keywords: [
    "Spindle",
    "Max McCutcheon",
    "LSM tree",
    "Rust",
    "key-value store",
    "storage engine",
    "write-ahead log",
    "SSTable",
  ],
} as const;

export type PlanId = "builder" | "scale";

export const plans = [
  {
    id: "free" as const,
    name: "Open Source",
    price: "$0",
    period: "forever",
    blurb: "The crate you can clone today. This is the artifact that ships.",
    features: [
      "MIT-licensed Rust LSM engine",
      "WAL, SSTables, leveled compaction, MVCC",
      "kill -9 crash tests in CI",
      "cargo run --example quickstart",
    ],
    cta: "View on GitHub",
    href: "https://github.com/maxmccutcheon59/spindle",
    external: true,
    highlighted: true,
  },
  {
    id: "builder" as const,
    name: "Builder",
    price: "$49",
    period: "/ month · proposed",
    blurb:
      "Early-access price note. Checkout can charge a card when Stripe keys exist. It does not provision storage or an endpoint.",
    features: [
      "No hosted cluster today",
      "No storage quota",
      "No uptime target",
      "Email the author — nothing is auto-provisioned",
    ],
    cta: "Read before paying",
    href: "/subscribe/builder/",
    external: false,
    highlighted: false,
  },
  {
    id: "scale" as const,
    name: "Scale",
    price: "$149",
    period: "/ month · proposed",
    blurb:
      "A larger proposed price for the same experiment. There is no production tier, dashboard, or recovery feature behind it yet.",
    features: [
      "Same limits as Builder",
      "No point-in-time recovery",
      "No usage dashboard",
      "Not a capacity plan",
    ],
    cta: "Read before paying",
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

/** Honest limits of the 0.1.0 engine and the website experiment. */
export const honestLimits = [
  {
    title: "Local library",
    body: "Spindle is an embedded crate. It has no network protocol, no accounts, and no operated region.",
  },
  {
    title: "Snapshot caveat",
    body: "Compaction keeps the newest version of a user key. A long-lived snapshot can miss versions compaction already dropped. Called out in DESIGN.md.",
  },
  {
    title: "No block cache",
    body: "Each SSTable is loaded as a whole file. Point reads are fine for the demo and get more expensive as levels grow.",
  },
  {
    title: "Cloud is a sketch",
    body: "Builder and Scale prices on this site do not provision storage. Stripe, when configured, can charge a card and nothing else.",
  },
] as const;

/** Short caveats for the pricing page. */
export const businessReasons = [
  {
    title: "The engine is free",
    body: "Clone the MIT crate and run cargo run --example quickstart. That path is what exists.",
  },
  {
    title: "Prices are notes",
    body: "$49 and $149 are proposed early-access figures. They are not a live capacity plan.",
  },
  {
    title: "No uptime target",
    body: "This site does not offer 99.5% or 99.9%. Those numbers are not a commitment.",
  },
  {
    title: "No customer list",
    body: "Nobody is running production traffic on Spindle Cloud. There is no Cloud data plane.",
  },
] as const;

export const credentials = [
  { label: "Language", value: "Rust 1.85+" },
  { label: "License", value: "MIT © Max" },
  { label: "Founder", value: "Max McCutcheon" },
  { label: "Email", value: "maxmccutcheon59@gmail.com" },
] as const;
