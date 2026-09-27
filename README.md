# Spindle

[![CI](https://github.com/maxmccutcheon59/spindle/actions/workflows/ci.yml/badge.svg)](https://github.com/maxmccutcheon59/spindle/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**An LSM-tree key-value engine in Rust**, by [Max McCutcheon](https://github.com/maxmccutcheon59).

Embedded store: write-ahead log, memtable, block-based SSTables, leveled compaction, bloom filters, MVCC snapshots, and range scans. It is a local library you can build, crash, and read. Version **0.1.0**. Educational scope — see [`SECURITY.md`](SECURITY.md).

**Email:** [maxmccutcheon59@gmail.com](mailto:maxmccutcheon59@gmail.com)

Design choices, failure modes, and benchmark limits: [`DESIGN.md`](DESIGN.md).

## Demo (~5 minutes)

Rust **1.85+** (`rust-toolchain.toml` pins 1.85.0).

```bash
git clone https://github.com/maxmccutcheon59/spindle.git
cd spindle
cargo run --example quickstart
```

That opens a temporary database and prints **put**, **get**, **delete**, **flush**, a **scan**, then a **reopen** that still sees the keys that survived. Source: [`examples/quickstart.rs`](examples/quickstart.rs).

```rust
use spindle::{Db, Options};

let db = Db::open(Options::new("./spindle-data"))?;
db.put(b"hello", b"world")?;
assert_eq!(db.get(b"hello")?.as_deref(), Some(b"world".as_slice()));
db.delete(b"hello")?;
db.flush()?;
for kv in db.scan(None, None)? {
    let _ = (kv.key, kv.value);
}
```

```bash
cargo test
cargo clippy --all-targets -- -D warnings
cargo bench --bench basic   # optional; local Criterion run
```

`./spindle-data/` is gitignored. The RocksDB comparison bench (`--features rocksdb-bench`) needs a C++ toolchain and is not part of CI.

## What it implements

| Piece | In this crate |
| --- | --- |
| WAL | Append before the memtable. `SyncPolicy::EveryWrite` (default, `fdatasync`) or `GroupCommit { group_commit_ms }` |
| Memtable | `BTreeMap` plus tombstones. Readers see an `Arc` published after each write |
| SSTables | Prefix-compressed blocks, sparse index, per-table bloom, 48-byte footer, magic `SPNDLSST` |
| Compaction | Background thread `spindle-compact`. L0 at 4 files; higher levels grow ×10. Seven levels (0–6) |
| Reads | Memtable, then immutable memtables, then SSTables. Bloom in front of each table |
| MVCC | Monotonic sequence numbers. `snapshot` / `get_snapshot` / `scan_snapshot` |
| Tests | Persistence, flush, MVCC, `kill -9` replay ([`tests/crash_kill9.rs`](tests/crash_kill9.rs)), SSTable fuzz |

Public API (`src/lib.rs`): `Db`, `open`, `Options`, `SyncPolicy`, `Snapshot`, `KvIter`, `Error`, `Result`. `Table` is also exported for the SSTable format.

## Website / experimental Cloud notes

Static site (GitHub Pages): [https://maxmccutcheon59.github.io/spindle/](https://maxmccutcheon59.github.io/spindle/)

**Ships today:** this engine, its tests, `DESIGN.md`, and a static site (about, design notes, get-started, an in-browser playground sketch).

**Experimental, not a product:** pages that mention **Spindle Cloud** ($49 / $149), **Stripe**, and **Spindle Agent**. Those are early-access founder notes. There is no multi-tenant data plane, no provisioned storage, no uptime target, and no customer base. A configured Stripe checkout can charge a card; it does not stand up a hosted database. The playground is a browser mock, not this crate.

```bash
cd website && cp .env.example .env.local && npm install && npm run dev
# http://127.0.0.1:43123
```

Stripe and Pages notes live in [`website/SETUP.md`](website/SETUP.md). Do not treat the site as a hosted KV service.

## License

MIT © Max McCutcheon. The engine is MIT. Cloud and Agent pages are experimental website copy, not a separate service.
