# Spindle

An LSM-tree key-value storage engine in Rust.

Spindle is a learning project: one repo, built milestone by milestone, with a
`DESIGN.md` that records the choices that matter in a systems interview —
WAL fsync policy, SSTable layout, leveled compaction ratios, MVCC sequence
numbers, and crash-recovery contracts.

## Quick start

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

## What is implemented

| Milestone | Status |
|-----------|--------|
| 1. Memtable `put`/`get`/`delete` + tombstones + benches | done |
| 2. WAL with replay + explainable fsync policy | done |
| 3. Block-based SSTables (sparse index, footer, flush) | done |
| 4. Read path + per-SSTable bloom filters | done |
| 5. Leveled compaction (background thread, ×10 sizes) | done |
| 6. Merging iterators / range scans | done |
| 7. MVCC sequence numbers + snapshots | done |
| 8. Crash harness + SSTable parser fuzz | done |
| 9. RocksDB comparison bench + honest analysis | harness ready |

See [`DESIGN.md`](DESIGN.md) for the design rationale and the interview
questions you should be able to answer after living through each milestone.

## Optional RocksDB bench

```bash
# Needs librocksdb / lz4 on the host.
cargo bench --bench rocksdb_compare --features rocksdb-bench
```

## License

MIT
