export const site = {
  name: "Spindle",
  tagline: "An LSM-tree key-value engine in Rust",
  description:
    "Spindle is Max McCutcheon’s MIT-licensed LSM-tree key-value engine in Rust: write-ahead log, SSTables with bloom filters, leveled compaction, and MVCC snapshots, with crash tests and design notes.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://maxmccutcheon59.github.io/spindle",
  github: "https://github.com/maxmccutcheon59/spindle",
  design:
    "https://github.com/maxmccutcheon59/spindle/blob/main/DESIGN.md",
  author: {
    name: "Max McCutcheon",
    handle: "maxmccutcheon59",
    role: "CS student, James Madison University",
    email: "MaxMcCutcheon1@outlook.com",
    github: "https://github.com/maxmccutcheon59",
    bio: "CS student at James Madison University. I wrote Spindle to understand a storage engine end to end: the fsync policy, the SSTable format, compaction, and what survives a crash.",
  },
  keywords: [
    "Spindle",
    "Max McCutcheon",
    "LSM tree Rust",
    "key-value store",
    "storage engine",
    "WAL SSTable",
    "MVCC",
  ],
} as const;

export const benches = [
  {
    name: "Mem-only put",
    value: "1.4 µs",
    detail: "Group-commit window, rarely fsyncs",
  },
  {
    name: "Durable put",
    value: "125 µs",
    detail: "fdatasync after every WAL append (disk-bound)",
  },
  {
    name: "Flushed get",
    value: "7.2 µs",
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

export const credentials = [
  { label: "Language", value: "Rust 1.85+" },
  { label: "License", value: "MIT © Max" },
  { label: "Author", value: "Max McCutcheon" },
  { label: "Email", value: "MaxMcCutcheon1@outlook.com" },
] as const;
