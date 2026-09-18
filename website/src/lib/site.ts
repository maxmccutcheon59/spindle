export const site = {
  name: "Spindle",
  tagline: "An LSM-tree key-value engine in Rust",
  description:
    "Spindle is a from-scratch LSM-tree storage engine: write-ahead log, block-based SSTables, leveled compaction, bloom filters, range scans, and MVCC — with kill-9 crash tests and honest benchmarks.",
  url: "https://maxmccutcheon59.github.io/spindle",
  github: "https://github.com/maxmccutcheon59/spindle",
  design:
    "https://github.com/maxmccutcheon59/spindle/blob/main/DESIGN.md",
  author: {
    name: "Max McCutcheon",
    github: "https://github.com/maxmccutcheon59",
  },
  keywords: [
    "Spindle",
    "LSM tree",
    "Rust",
    "key-value store",
    "storage engine",
    "SSTable",
    "WAL",
    "compaction",
    "MVCC",
    "database intern",
  ],
} as const;

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
