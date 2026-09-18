# Spindle

[![CI](https://github.com/maxmccutcheon59/spindle/actions/workflows/ci.yml/badge.svg)](https://github.com/maxmccutcheon59/spindle/actions/workflows/ci.yml)

An LSM-tree key-value storage engine written in Rust — plus **Spindle Cloud**, a paid managed tier ($49 / $149 mo) with Stripe checkout.

Implements a write-ahead log, block-based SSTables, leveled compaction, bloom filters, range scans, and MVCC snapshots — with crash-recovery tests and a design document that explains the trade-offs.

**Product site (local):** [http://127.0.0.1:43123](http://127.0.0.1:43123/) · **Design:** [`DESIGN.md`](DESIGN.md)

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

## Spindle Cloud (SaaS site)

```bash
cd website
cp .env.example .env.local
npm install
npm run dev
```

- Pricing: `/pricing/` — Open Source / Builder $49 / Scale $149
- Checkout: `/subscribe/builder/` (demo mode without Stripe; Payment Links when configured)
- Deploy on **Google Firebase Hosting**: see `website/README.md`

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

## RocksDB comparison (optional)

```bash
cargo bench --bench rocksdb_compare --features rocksdb-bench
```

Requires system RocksDB / lz4. Recorded numbers and analysis go in `DESIGN.md` §9.

## License

MIT (engine). Cloud subscriptions billed separately via Stripe.
