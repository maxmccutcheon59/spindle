# Spindle

[![CI](https://github.com/maxmccutcheon59/spindle/actions/workflows/ci.yml/badge.svg)](https://github.com/maxmccutcheon59/spindle/actions/workflows/ci.yml)
[![Site](https://img.shields.io/badge/site-spindle-0f7a7a)](https://maxmccutcheon59.github.io/spindle/)

An LSM-tree key-value storage engine written in Rust.

Implements a write-ahead log, block-based SSTables, leveled compaction, bloom filters, range scans, and MVCC snapshots — with crash-recovery tests and a design document that explains the trade-offs.

**Site:** [maxmccutcheon59.github.io/spindle](https://maxmccutcheon59.github.io/spindle/) · **Design:** [`DESIGN.md`](DESIGN.md)

## Build

```bash
cargo test
cargo clippy --all-targets -- -D warnings
cargo bench --bench basic
```

```rust
use spindle::{Db, Options};

let db = Db::open(Options::new("./spindle-data"))?;
db.put(b"hello", b"world")?;
assert_eq!(db.get(b"hello")?, Some(b"world".to_vec()));
db.delete(b"hello")?;
```

## Components

| Area | Notes |
|------|--------|
| Memtable | `BTreeMap` with tombstones |
| WAL | Append-before-memtable; `EveryWrite` or group-commit fsync |
| SSTables | Block-based, sparse index, footer, per-table bloom filter |
| Compaction | Leveled (×10 size ratio), background thread |
| Reads | Memtable → immutables → SSTables; merging iterators for scans |
| MVCC | Sequence numbers + snapshot reads |
| Hardening | `kill -9` crash harness; adversarial SSTable parser tests |

## Website

```bash
cd website
npm install
npm run dev -- --port 43123
```

Static export deploys to GitHub Pages via `.github/workflows/pages.yml`.

## RocksDB comparison (optional)

```bash
cargo bench --bench rocksdb_compare --features rocksdb-bench
```

Requires system RocksDB / lz4. Recorded numbers and analysis go in `DESIGN.md` §9.

## License

MIT
