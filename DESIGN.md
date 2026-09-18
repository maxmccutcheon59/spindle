# Spindle design notes

Living document. Updated as milestones land. The interview value of this
repo is being able to defend every choice below without looking it up.

---

## 1. Memtable (`BTreeMap` + tombstones)

**Design space**

1. **Skiplist** (LevelDB / RocksDB default) — lock-free concurrent reads,
   predictable insert latency, harder to implement correctly.
2. **BTreeMap** — simple, cache-friendly, single-writer under a mutex.
3. **Hash + sorted vector** — fast point lookups, painful range scans.

**Choice:** `BTreeMap<InternalKey, Vec<u8>>`. Single writer, readers see an
`Arc` snapshot published after each write. Deletes are tombstones
(`ValueType::Deletion`), not removals — older Puts must stay until
compaction, because a snapshot may still need them.

**Failure modes:** publishing a half-updated map; losing tombstones on
flush so a deleted key resurrects from an older SSTable.

**Tests:** put/get/delete; snapshot sees older value; delete then reopen.

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

**Spindle:** `SyncPolicy::EveryWrite` (default) and `GroupCommit { ms }`.
`put` returns `Ok` only after the policy's sync has completed.

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
- Level L bytes > `level_base_bytes * 10^(L-1)` (defaults: 10 MiB base, ×10).

**Why ×10:** LevelDB's default. Write amp ≈ 10 per level; read amp and
file count stay bounded. RocksDB keeps the same for classic leveled mode.

Compaction merges inputs, keeps the newest version per user key, drops
tombstones only at the bottom level, writes outputs to `level+1`, updates
MANIFEST, unlinks inputs.

**Known simplification:** we drop older versions during compaction even if
an open snapshot might need them. Snapshot correctness across compaction
needs a snapshot list + "earliest seq to preserve" — tracked as future
work. Snapshots are correct against data that has not yet been compacted
away.

---

## 6. Iterators / range scans

Merging iterator over memtables + SSTables via a min-heap on internal
keys. Collapse to the newest visible user key at the snapshot sequence;
skip tombstones in the user-visible stream. API: `scan(start, end)` and
`scan_snapshot`.

---

## 7. MVCC

Every write allocates a monotonic `SequenceNumber`. Internal keys pack
`(seq << 8 | type)`. Snapshots are just a sequence number; reads ignore
keys with `seq > snapshot`.

---

## 8. Crash testing + fuzz

- `tests/crash_kill9.rs`: child process ACKs puts to a side file, parent
  `kill -9`s it, reopens, asserts every ACK'd index is present.
- `tests/fuzz_sstable.rs`: proptest over arbitrary bytes and truncated
  valid tables — parser must not panic.

---

## 9. RocksDB comparison (harness)

```bash
cargo bench --bench rocksdb_compare --features rocksdb-bench
cargo bench --bench basic
```

### Expected losses (honest, before numbers)

| Workload | Why Spindle loses |
|----------|-------------------|
| Sync put | We publish a full memtable clone per write; RocksDB uses a skiplist. |
| Sync put | No group-commit batching of the syscall path by default. |
| Random get | Whole SSTable mmap'd into a `Vec<u8>` — no block cache, no OS warm. |
| Scan | Materializes the merge into a `Vec` instead of streaming. |
| Compaction | Single thread, no trivial-move, no compression. |

Publish real numbers in this section after running the optional bench on
a quiet machine. Do not invent them.

---

## Reading list

1. O'Neil et al., *The Log-Structured Merge-Tree* (1996)
2. LevelDB source (`db/`, `table/`, `db/version_set.cc`)
3. Kleppmann, *DDIA*, Chapter 3
