export const site = {
  name: "Spindle",
  product: "Spindle Cloud",
  tagline: "Durable key-value storage, built by Max McCutcheon",
  description:
    "Spindle is Max McCutcheon's LSM-tree storage engine in Rust — WAL, leveled compaction, MVCC, crash tests — with Spindle Cloud for managed subscriptions. Portfolio-grade systems software you can read and run.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://maxmccutcheon59.github.io/spindle",
  github: "https://github.com/maxmccutcheon59/spindle",
  design:
    "https://github.com/maxmccutcheon59/spindle/blob/main/DESIGN.md",
  author: {
    name: "Max McCutcheon",
    handle: "maxmccutcheon59",
    role: "Software engineer",
    email: "maxmccutcheon59@gmail.com",
    github: "https://github.com/maxmccutcheon59",
    bio: "I build systems software you can defend in an interview — storage, durability, and the trade-offs written down. Spindle is my from-scratch LSM engine; Spindle Cloud is the managed layer on top.",
  },
  ownership:
    "Spindle, Spindle Cloud, and Spindle Agent are solely owned and operated by Max McCutcheon (maxmccutcheon59@gmail.com). The open-source engine is MIT-licensed; the Cloud product, website, branding, and Agent are Max’s.",
  keywords: [
    "Spindle",
    "Spindle Cloud",
    "Max McCutcheon",
    "maxmccutcheon59",
    "Max McCutcheon Spindle",
    "Spindle LSM",
    "Spindle Rust",
    "LSM tree",
    "Rust storage engine",
    "managed key-value store",
    "SaaS database",
    "MVCC",
    "internship portfolio",
  ],
} as const;

export type PlanId = "builder" | "scale";

export const plans = [
  {
    id: "free" as const,
    name: "Open Source",
    price: "$0",
    period: "forever",
    blurb: "Clone Max’s engine. Full source, crash harness, design notes.",
    features: [
      "MIT-licensed Rust LSM engine",
      "WAL, SSTables, leveled compaction",
      "kill -9 crash tests in CI",
      "Self-host on your metal",
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
      "Managed Spindle for side projects and staging — durability without ops theater.",
    features: [
      "25 GB durable storage",
      "Daily snapshots",
      "Single-region Cloud endpoint",
      "Email support from Max · 99.5% target",
      "Cancel anytime",
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
    blurb: "Production KV with room to grow — the plan you can defend to a CFO.",
    features: [
      "250 GB durable storage",
      "Point-in-time recovery (7 days)",
      "Priority support · 99.9% target",
      "Usage dashboards & audit log",
      "Cancel anytime",
    ],
    cta: "Start Scale",
    href: "/subscribe/scale/",
    external: false,
    highlighted: false,
  },
] as const;

export function stripePaymentLink(plan: PlanId): string | null {
  if (typeof process === "undefined") return null;
  if (plan === "builder") {
    return process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BUILDER || null;
  }
  return process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_SCALE || null;
}

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

export const saasPromises = [
  {
    title: "Durability you can quote",
    body: "Every acknowledged put crosses an fsync policy. The open-source harness kill -9s the process and checks the log — Cloud inherits that contract.",
  },
  {
    title: "Ops without the folklore",
    body: "Compaction, snapshots, and disk hygiene stay on Max’s side of the fence. You get an endpoint and a bill you can explain.",
  },
  {
    title: "Engine you can still open",
    body: "The paid tier is managed ops on the same LSM Max published on GitHub. No black-box storage myth.",
  },
] as const;

export const credentials = [
  { label: "Language", value: "Rust 1.85+" },
  { label: "License", value: "MIT © Max" },
  { label: "Owner", value: "Max McCutcheon" },
  { label: "Email", value: "maxmccutcheon59@gmail.com" },
] as const;
