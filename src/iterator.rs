//! Merging iterators for range scans across memtables and SSTables.

use std::cmp::Ordering;
use std::collections::BinaryHeap;
use std::sync::Arc;

use crate::error::Result;
use crate::keys::{InternalKey, SequenceNumber, ValueType};
use crate::memtable::MemTable;
use crate::sstable::Table;

/// User-visible key/value yielded by a range scan.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct KvPair {
    /// User key.
    pub key: Vec<u8>,
    /// Value; `None` means a tombstone was visible (filtered out of scans).
    pub value: Vec<u8>,
}

/// Public range iterator type.
pub struct KvIter {
    inner: Vec<KvPair>,
    pos: usize,
}

impl KvIter {
    pub(crate) fn from_pairs(pairs: Vec<KvPair>) -> Self {
        Self {
            inner: pairs,
            pos: 0,
        }
    }
}

impl Iterator for KvIter {
    type Item = KvPair;

    fn next(&mut self) -> Option<Self::Item> {
        if self.pos >= self.inner.len() {
            return None;
        }
        let item = self.inner[self.pos].clone();
        self.pos += 1;
        Some(item)
    }
}

/// Merge several already-sorted internal-key streams (compaction helper).
pub fn merge_internal_keys(
    streams: Vec<Vec<(InternalKey, Vec<u8>)>>,
) -> Vec<(InternalKey, Vec<u8>)> {
    #[derive(Eq, PartialEq)]
    struct HeapItem {
        key: InternalKey,
        value: Vec<u8>,
        stream: usize,
        index: usize,
    }

    impl Ord for HeapItem {
        fn cmp(&self, other: &Self) -> Ordering {
            // Min-heap via reverse.
            InternalKey::cmp_internal(&other.key, &self.key)
                .then_with(|| other.stream.cmp(&self.stream))
        }
    }

    impl PartialOrd for HeapItem {
        fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
            Some(self.cmp(other))
        }
    }

    let mut heap = BinaryHeap::new();
    for (s, stream) in streams.iter().enumerate() {
        if let Some((k, v)) = stream.first() {
            heap.push(HeapItem {
                key: k.clone(),
                value: v.clone(),
                stream: s,
                index: 0,
            });
        }
    }

    let mut out = Vec::new();
    while let Some(item) = heap.pop() {
        out.push((item.key.clone(), item.value));
        let next = item.index + 1;
        if next < streams[item.stream].len() {
            let (k, v) = &streams[item.stream][next];
            heap.push(HeapItem {
                key: k.clone(),
                value: v.clone(),
                stream: item.stream,
                index: next,
            });
        }
    }
    out
}

/// Build a user-visible range over memtables + SSTables at `snapshot`.
pub fn scan_range(
    mem: &MemTable,
    imms: &[Arc<MemTable>],
    tables: &[Arc<Table>],
    start: Option<&[u8]>,
    end: Option<&[u8]>,
    snapshot: SequenceNumber,
) -> Result<KvIter> {
    let mut streams: Vec<Vec<(InternalKey, Vec<u8>)>> = Vec::new();

    let collect_mem = |mt: &MemTable| -> Vec<(InternalKey, Vec<u8>)> {
        mt.iter()
            .filter(|(k, _)| {
                if k.sequence > snapshot {
                    return false;
                }
                if let Some(s) = start {
                    if k.user_key.as_slice() < s {
                        return false;
                    }
                }
                if let Some(e) = end {
                    if k.user_key.as_slice() >= e {
                        return false;
                    }
                }
                true
            })
            .map(|(k, v)| (k.clone(), v.clone()))
            .collect()
    };

    streams.push(collect_mem(mem));
    for imm in imms {
        streams.push(collect_mem(imm));
    }
    for table in tables {
        let mut rows = Vec::new();
        for item in table.iter()? {
            let (k, v) = item?;
            if k.sequence > snapshot {
                continue;
            }
            if let Some(s) = start {
                if k.user_key.as_slice() < s {
                    continue;
                }
            }
            if let Some(e) = end {
                if k.user_key.as_slice() >= e {
                    continue;
                }
            }
            rows.push((k, v));
        }
        streams.push(rows);
    }

    let merged = merge_internal_keys(streams);

    // Collapse to newest visible user key; skip deletions.
    let mut pairs = Vec::new();
    let mut last_user: Option<Vec<u8>> = None;
    for (k, v) in merged {
        if last_user.as_ref() == Some(&k.user_key) {
            continue;
        }
        last_user = Some(k.user_key.clone());
        if k.value_type == ValueType::Deletion {
            continue;
        }
        pairs.push(KvPair {
            key: k.user_key,
            value: v,
        });
    }

    Ok(KvIter::from_pairs(pairs))
}
