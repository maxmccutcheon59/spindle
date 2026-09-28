# Spindle

[![CI](https://github.com/maxmccutcheon59/spindle/actions/workflows/ci.yml/badge.svg)](https://github.com/maxmccutcheon59/spindle/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**An LSM-tree key-value engine in Rust**, by [Max McCutcheon](https://github.com/maxmccutcheon59).

Local library: write-ahead log, memtable, block-based SSTables, leveled compaction, bloom filters, MVCC snapshots, and range scans. Version **0.1.0**. MIT. Design notes: [`DESIGN.md`](DESIGN.md). Vulnerability reports: [`SECURITY.md`](SECURITY.md).

**Email:** [MaxMcCutcheon1@outlook.com](mailto:MaxMcCutcheon1@outlook.com)

## Demo (~5 minutes)

Rust **1.85+** (`rust-toolchain.toml` pins 1.85.0).

```bash
git clone https://github.com/maxmccutcheon59/spindle.git
cd spindle
cargo run --example quickstart
```

That prints **put**, **get**, **delete**, **flush**, a **scan**, and a **reopen**. Source: [`examples/quickstart.rs`](examples/quickstart.rs).

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

`./spindle-data/` is gitignored.

```bash
cargo test
cargo clippy --all-targets -- -D warnings
```

`cargo bench --bench basic` is optional and local. The RocksDB bench (`--features rocksdb-bench`) needs a C++ toolchain and is not in CI.

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

Public API (`src/lib.rs`): `Db`, `open`, `Options`, `SyncPolicy`, `Snapshot`, `KvIter`, `Error`, `Result`. `Table` is also exported.

## Optional: website

A static site is on [GitHub Pages](https://maxmccutcheon59.github.io/spindle/). Spindle Cloud there is a waitlist for a possible managed version, not a hosted database; nothing is for sale. See [`website/README.md`](website/README.md).

## License

MIT © Max McCutcheon.
