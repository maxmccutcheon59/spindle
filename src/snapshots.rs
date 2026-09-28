//! Registry of live read snapshots.
//!
//! Compaction may only discard an old version of a key when no reader can
//! still ask for it. Readers that pin a sequence number register it here;
//! compaction asks for the oldest sequence still in use.

use std::collections::BTreeMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;

use parking_lot::Mutex;

use crate::keys::SequenceNumber;

#[derive(Debug)]
pub(crate) struct SnapshotList {
    /// Pinned sequence -> number of snapshots holding it.
    live: Mutex<BTreeMap<SequenceNumber, usize>>,
    last_sequence: Arc<AtomicU64>,
}

impl SnapshotList {
    pub(crate) fn new(last_sequence: Arc<AtomicU64>) -> Self {
        Self {
            live: Mutex::new(BTreeMap::new()),
            last_sequence,
        }
    }

    /// Pin the current sequence. The sequence is read while holding the lock
    /// so a concurrent [`Self::oldest`] either sees this snapshot or was
    /// computed from a sequence no later than it.
    pub(crate) fn acquire(&self) -> SequenceNumber {
        let mut live = self.live.lock();
        let seq = self.last_sequence.load(Ordering::Acquire);
        *live.entry(seq).or_insert(0) += 1;
        seq
    }

    pub(crate) fn release(&self, seq: SequenceNumber) {
        let mut live = self.live.lock();
        if let Some(n) = live.get_mut(&seq) {
            *n -= 1;
            if *n == 0 {
                live.remove(&seq);
            }
        }
    }

    /// Oldest sequence a reader may still request: the oldest live snapshot,
    /// or the current sequence when there are none. Plain reads use
    /// `MAX_SEQUENCE` and only ever need the newest version.
    pub(crate) fn oldest(&self) -> SequenceNumber {
        let live = self.live.lock();
        live.keys()
            .next()
            .copied()
            .unwrap_or_else(|| self.last_sequence.load(Ordering::Acquire))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn oldest_tracks_live_snapshots() {
        let seq = Arc::new(AtomicU64::new(10));
        let list = SnapshotList::new(Arc::clone(&seq));
        assert_eq!(list.oldest(), 10, "no snapshots: current sequence");

        let a = list.acquire();
        seq.store(20, Ordering::Release);
        let b = list.acquire();
        let b2 = list.acquire();
        assert_eq!((a, b, b2), (10, 20, 20));
        assert_eq!(list.oldest(), 10);

        list.release(a);
        assert_eq!(list.oldest(), 20);
        list.release(b);
        assert_eq!(list.oldest(), 20, "second holder of 20 still live");
        list.release(b2);
        seq.store(30, Ordering::Release);
        assert_eq!(list.oldest(), 30);
    }

    #[test]
    fn release_of_unknown_sequence_is_harmless() {
        let list = SnapshotList::new(Arc::new(AtomicU64::new(1)));
        list.release(99);
        assert_eq!(list.oldest(), 1);
    }
}
