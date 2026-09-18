//! In-memory write buffer: a sorted map of internal keys.
//!
//! We use `BTreeMap` rather than a skiplist. Skiplists match LevelDB and
//! give lock-free concurrent reads, but for a single-writer learning
//! engine the BTree is simpler to reason about and still O(log n).

use std::collections::BTreeMap;
use std::sync::atomic::{AtomicUsize, Ordering as AtomicOrdering};

use crate::keys::{InternalKey, LookupKey, ValueType};

/// Approximate memory accounting for flush decisions.
#[derive(Debug, Default)]
pub struct MemTable {
    map: BTreeMap<InternalKey, Vec<u8>>,
    approx_bytes: AtomicUsize,
}

impl MemTable {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn approx_bytes(&self) -> usize {
        self.approx_bytes.load(AtomicOrdering::Relaxed)
    }

    pub fn is_empty(&self) -> bool {
        self.map.is_empty()
    }

    /// Insert a put or delete. Values for deletions are empty.
    pub fn add(&mut self, key: InternalKey, value: Vec<u8>) {
        let entry_bytes = key.user_key.len() + value.len() + 16;
        self.approx_bytes
            .fetch_add(entry_bytes, AtomicOrdering::Relaxed);
        self.map.insert(key, value);
    }

    pub fn get(&self, lookup: &LookupKey) -> MemGet {
        let user_key = lookup.user_key();
        let seq = {
            let enc = lookup.encoded();
            let packed = u64::from_le_bytes(enc[enc.len() - 8..].try_into().unwrap());
            packed >> 8
        };

        // Our ordering puts higher sequences first for the same user key,
        // so ranging from the lookup key walks newest → oldest.
        let start = InternalKey::new(user_key.to_vec(), seq, ValueType::Value);
        for (ik, val) in self.map.range(start..) {
            if ik.user_key.as_slice() != user_key {
                break;
            }
            if ik.sequence > seq {
                continue;
            }
            return match ik.value_type {
                ValueType::Deletion => MemGet::Deleted,
                ValueType::Value => MemGet::Found(val.clone()),
            };
        }
        MemGet::NotFound
    }

    pub fn iter(&self) -> impl Iterator<Item = (&InternalKey, &Vec<u8>)> + '_ {
        self.map.iter()
    }
}

/// Result of a point lookup against a memtable.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum MemGet {
    /// Visible value.
    Found(Vec<u8>),
    /// Tombstone covers this key at the snapshot.
    Deleted,
    /// No entry for this user key.
    NotFound,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn put_get_delete() {
        let mut mt = MemTable::new();
        mt.add(
            InternalKey::new(b"a".to_vec(), 1, ValueType::Value),
            b"1".to_vec(),
        );
        mt.add(
            InternalKey::new(b"a".to_vec(), 2, ValueType::Value),
            b"2".to_vec(),
        );
        mt.add(
            InternalKey::new(b"a".to_vec(), 3, ValueType::Deletion),
            Vec::new(),
        );

        let snap2 = LookupKey::new(b"a", 2);
        assert_eq!(mt.get(&snap2), MemGet::Found(b"2".to_vec()));

        let snap3 = LookupKey::new(b"a", 3);
        assert_eq!(mt.get(&snap3), MemGet::Deleted);

        let missing = LookupKey::new(b"z", 10);
        assert_eq!(mt.get(&missing), MemGet::NotFound);
    }
}
