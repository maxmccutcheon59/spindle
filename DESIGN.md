# Spindle design notes

Interview deep-dive for the engine in [README.md](README.md).
See put, get, delete, flush, and scan first:

```bash
cargo run --example quickstart
```

Living document. Updated as milestones land. The interview value of this
repo is being able to defend every choice below without looking it up.

---

## 1. Memtable (`BTreeMap` + tombstones)

**Design space**

1. **Skiplist** (LevelDB / RocksDB default) — lock-free concurrent reads,
   predictable insert latency, harder to implement correctly.
2. **BTreeMap** — simple, cache-friendly, single-writer under a mutex.
3. **Hash + sorted vector** — fast point lookups, painful range scans.

**Choice:** `BTreeMap<InternalKey, Vec<u8>>` behind a reader-writer lock.
Writers are serialized by a mutex and hold the exclusive memtable lock only
for the single insert; readers share it. Deletes are tombstones
(`ValueType::Deletion`), not removals — older Puts must stay until
compaction, because a snapshot may still need them.

An earlier version published a fresh copy of the whole map after every write
so readers never blocked. That made each `put` cost O(entries buffered) —
about 200 µs at 1,000 entries — and is gone; see the benchmarks below.

**Failure modes:** a reader missing data while the memtable is rotated into the
immutable list (rotation holds the immutable-list lock across the swap, so
readers always find it in one place or the other); losing tombstones on flush
so a deleted key resurrects from an older SSTable.

**Tests:** put/get/delete; snapshot sees older value; delete then reopen;
acknowledged writes stay visible to concurrent readers during constant rotation
(fails if the swap is made non-atomic).

---

## 2. Write-ahead log + fsync policy

**Design space**

1. **Sync every write** — simple durability, ~disk IOPS bound.
2. **Group commit** — coalesce several writers into one `fdatasync`.
3. **No sync / periodic** — throughput king, loses acknowledged writes on
   crash (unacceptable for "durable" APIs).

**What LevelDB/RocksDB do:** WAL append before memtable insert; `sync`
flag on the write options controls `fdatasync`. RocksDB adds group commit
and pipelined writes.

**Spindle:** `SyncPolicy::EveryWrite` (default) and
`SyncPolicy::GroupCommit { group_commit_ms }`. `put` returns `Ok` only
after the policy's sync has completed.

### The interview question

> Process dies between WAL fsync and memtable insert. What happens?

The write was acknowledged (fsync returned) but is not in the memtable.
On restart, WAL replay re-applies it. **No acknowledged write is lost.**
If we died *before* fsync returned, we never acknowledged — losing it is
correct.

Torn tails (partial record at EOF) are truncated on replay, not treated
as corruption of prior records.

---

## 3. SSTable format

Block-based, sorted, LevelDB-shaped:

```
[data blocks...][bloom meta block][index block][footer 48B]
```

- Data blocks: restart-interval prefix compression, trailing CRC.
- Index: sparse — one entry per data block (separator key → handle).
- Footer: bloom handle, index handle, magic `SPNDLSST`.

**Flush:** when the memtable hits `write_buffer_size`, freeze it, open a
new WAL, write an L0 SSTable, update MANIFEST/`CURRENT`, delete the old
WAL.

---

## 4. Read path + blooms

Order: **active memtable → immutable memtables (newest first) → SSTables
newest-first (L0 by file number, then L1…Ln)**.

Stop on first Found or Deleted. Bloom filter (Kirsch–Mitzenmacher double
hash, `bits_per_key=10`) sits in front of each SSTable to skip disk for
absent keys. False positives only cost a block read; false negatives are
bugs.

---

## 5. Leveled compaction

Background thread (`spindle-compact`) picks work when:

- L0 file count ≥ 4, or
- Level L (L ≥ 1) bytes > `level_base_bytes * 10^(L-1)` (defaults: 10 MiB base, ×10).

There are seven levels, `0..=6` (`NUM_LEVELS` in `src/version.rs`). L0 is
file-count only. Levels 1 through 5 use the byte target above
(`multiplier.pow(level - 1)`). Level 6 is the bottom: nothing compacts out
of it, and tombstones are dropped only when the compaction output level is 6.

**Why ×10:** LevelDB's default. Write amp ≈ 10 per level; read amp and
file count stay bounded. RocksDB keeps the same for classic leveled mode.

Compaction merges inputs, writes outputs to `level+1`, updates MANIFEST, and
unlinks inputs. For each user key it keeps every version newer than the oldest
live snapshot, plus the newest version at or below it (LevelDB's rule);
anything older is invisible to every possible reader and is dropped. A
tombstone is dropped only at the bottom level and only once no snapshot is
older than it — otherwise the value it hides would reappear.

**Snapshots pin garbage collection.** `Db::snapshot()` registers its sequence
in a registry; the last clone of a `Snapshot` unregisters it on drop. Plain
`get`/`scan` read "at the newest sequence" and never need old versions. The
registry read and the sequence read happen under one lock, so a snapshot taken
while a compaction is starting can only be newer than the bound the compaction
uses.

**Cost:** a snapshot held for a long time keeps old versions alive on disk.

**Tests:** unit tests for the keep/drop rule with a pinned sequence; a database
test that reads through a snapshot after compaction has run; a randomized model
test (`tests/model.rs`) comparing the database, including snapshots, flushes,
compaction and reopen, against a `BTreeMap`.

---

## 6. Iterators / range scans

Merging iterator over memtables + SSTables via a min-heap on internal
keys. Collapse to the newest visible user key at the snapshot sequence;
skip tombstones in the user-visible stream. API: `scan(start, end)` and
`scan_snapshot`.

---

## 7. MVCC

Every write allocates a monotonic `SequenceNumber`. Internal keys pack
`(seq << 8 | type)`. A snapshot is a sequence number plus a registration that
keeps compaction from discarding what it can see; reads ignore keys with
`seq > snapshot`.

---

## 8. Crash testing + fuzz

- `tests/crash_kill9.rs`: child process ACKs puts to a side file, parent
  `kill -9`s it, reopens, asserts every ACK'd index is present.
- `tests/fuzz_sstable.rs`: proptest over arbitrary bytes and truncated
  valid tables — parser must not panic.

---

## 9. Benchmarks

```bash
cargo bench --bench basic
cargo bench --bench rocksdb_compare --features rocksdb-bench  # needs librocksdb + C++ toolchain
```

### Spindle microbenchmarks (2026-09-28, 4-core cloud VM)

Criterion, 4 s per benchmark, `tempfile` dirs. Treat as directional, not a
paper result; the durable number in particular depends on the disk.

| Bench | Median latency | Notes |
|-------|----------------|-------|
| `put/mem_only_no_sync` | ~1.9 µs/op | GroupCommit window 60s ≈ rarely fsyncs |
| `put/mem_only_prefilled_{1000,20000,100000}` | ~2.0–2.1 µs/op | flat as the memtable grows |
| `put/durable_every_write` | ~238 µs/op | `fdatasync` after every WAL append |
| `get/random_after_flush` | ~8.0 µs/op | 10k keys flushed to one SSTable |

**Before/after of the write-path fix** (same machine, same benchmark file): with
1,000 entries already buffered a `put` took ~209 µs; it now takes ~2.1 µs
(~100×). The old cost grew by roughly 0.2 µs per buffered entry (every write
copied the memtable), so at 20,000 entries the old code took milliseconds per
put, and the 100,000-entry benchmark did not finish in several minutes.
The earlier figures in this file (256 µs / 686 µs / 5.5 µs) came from a
different machine and included that bug.

Durable puts are ~125× slower than the no-sync path — expected: we pay for
`sync_data` on every acknowledged write. Gets after flush are decent for a
whole-file load + bloom probe, but will degrade as levels grow (no block cache).

### RocksDB comparison

Harness: `benches/rocksdb_compare.rs` (feature `rocksdb-bench`). **Not run in
the Cloud Agent VM** — `librocksdb-sys` failed to compile (`#include <memory>` /
`<limits>` missing; incomplete C++ standard library in the image). Run locally
on a machine with a full C++ toolchain + RocksDB deps, then paste numbers here.

### Expected losses (honest)

| Workload | Why Spindle loses |
|----------|-------------------|
| Sync put | Full memtable clone published per write; RocksDB uses a skiplist |
| Sync put | No group-commit coalescing of the syscall path by default |
| Random get | Whole SSTable loaded into a `Vec<u8>` — no block cache |
| Scan | Materializes the merge into a `Vec` instead of streaming |
| Compaction | Single thread, no trivial-move, no compression |

---

## Reading list

1. O'Neil et al., *The Log-Structured Merge-Tree* (1996)
2. LevelDB source (`db/`, `table/`, `db/version_set.cc`)
3. Kleppmann, *DDIA*, Chapter 3
