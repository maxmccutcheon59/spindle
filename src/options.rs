//! Tunables for opening a [`crate::Db`].

use std::path::PathBuf;

/// When to call `fsync`/`fdatasync` on the WAL.
///
/// Failure-mode reminder: an acknowledged write that has not been
/// synced can disappear across `kill -9` or power loss. Spindle only
/// returns `Ok` from `put`/`delete` after the chosen policy has been
/// satisfied.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum SyncPolicy {
    /// `fdatasync` after every WAL append. Safest, slowest.
    /// Matches LevelDB's default when `options.sync = true`.
    #[default]
    EveryWrite,
    /// Group commits: sync at most once per `group_commit_ms`.
    /// Acknowledged writes may wait briefly for a peer sync.
    GroupCommit {
        /// Maximum delay before forcing a sync.
        group_commit_ms: u64,
    },
}

/// Database open / runtime options.
#[derive(Debug, Clone)]
pub struct Options {
    /// Directory that holds WAL, MANIFEST, and SSTables.
    pub path: PathBuf,
    /// Flush memtable when it reaches this many bytes (approx).
    pub write_buffer_size: usize,
    /// Target data-block size inside an SSTable.
    pub block_size: usize,
    /// Level size multiplier (LevelDB/RocksDB default: 10).
    pub level_size_multiplier: u64,
    /// Max bytes for level 1; higher levels grow by `level_size_multiplier`.
    pub level_base_bytes: u64,
    /// WAL durability policy.
    pub sync: SyncPolicy,
    /// Bits per key for per-SSTable bloom filters. 0 disables blooms.
    pub bloom_bits_per_key: usize,
    /// Max number of immutable memtables waiting to flush.
    pub max_imm_memtables: usize,
    /// Disable the background compaction thread (tests).
    pub disable_compaction: bool,
}

impl Options {
    /// Create options rooted at `path` with LevelDB-ish defaults.
    pub fn new(path: impl Into<PathBuf>) -> Self {
        Self {
            path: path.into(),
            write_buffer_size: 4 * 1024 * 1024,
            block_size: 4 * 1024,
            level_size_multiplier: 10,
            level_base_bytes: 10 * 1024 * 1024,
            sync: SyncPolicy::EveryWrite,
            bloom_bits_per_key: 10,
            max_imm_memtables: 2,
            disable_compaction: false,
        }
    }
}
