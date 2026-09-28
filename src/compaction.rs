//! Background leveled compaction.
//!
//! Size ratios: Level-1 target = `level_base_bytes` (default 10 MiB).
//! Level L target = base * `level_size_multiplier`^(L-1) with multiplier 10.
//! Why 10: LevelDB's choice — amplifies write cost by ~10× per level but
//! keeps read amplification and file count manageable. RocksDB keeps the
//! same default for leveled compaction; dynamic level bytes is an option
//! we deliberately skip for clarity.

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread::{self, JoinHandle};
use std::time::Duration;

use crossbeam_channel::{Receiver, Sender};
use parking_lot::Mutex;

use crate::error::Result;
use crate::iterator::merge_internal_keys;
use crate::keys::{InternalKey, SequenceNumber, ValueType};
use crate::options::Options;
use crate::snapshots::SnapshotList;
use crate::sstable::TableBuilder;
use crate::version::{sstable_path, CompactionJob, FileMeta, VersionSet};

pub enum CompactionMsg {
    Check,
    Stop,
}

pub struct CompactionHandle {
    tx: Sender<CompactionMsg>,
    join: Option<JoinHandle<()>>,
    stop: Arc<AtomicBool>,
}

impl CompactionHandle {
    pub fn request_check(&self) {
        let _ = self.tx.send(CompactionMsg::Check);
    }

    pub fn stop(mut self) {
        self.stop.store(true, Ordering::SeqCst);
        let _ = self.tx.send(CompactionMsg::Stop);
        if let Some(j) = self.join.take() {
            let _ = j.join();
        }
    }
}

impl Drop for CompactionHandle {
    fn drop(&mut self) {
        self.stop.store(true, Ordering::SeqCst);
        let _ = self.tx.send(CompactionMsg::Stop);
        if let Some(j) = self.join.take() {
            let _ = j.join();
        }
    }
}

pub fn spawn_compaction(
    opts: Options,
    versions: Arc<Mutex<VersionSet>>,
    snapshots: Arc<SnapshotList>,
) -> CompactionHandle {
    let (tx, rx) = crossbeam_channel::unbounded();
    let stop = Arc::new(AtomicBool::new(false));
    let stop2 = Arc::clone(&stop);
    let join = thread::Builder::new()
        .name("spindle-compact".into())
        .spawn(move || worker(opts, versions, snapshots, rx, stop2))
        .expect("spawn compaction thread");
    CompactionHandle {
        tx,
        join: Some(join),
        stop,
    }
}

fn worker(
    opts: Options,
    versions: Arc<Mutex<VersionSet>>,
    snapshots: Arc<SnapshotList>,
    rx: Receiver<CompactionMsg>,
    stop: Arc<AtomicBool>,
) {
    loop {
        if stop.load(Ordering::SeqCst) {
            break;
        }
        match rx.recv_timeout(Duration::from_millis(200)) {
            Ok(CompactionMsg::Stop) | Err(crossbeam_channel::RecvTimeoutError::Disconnected) => {
                break;
            }
            Ok(CompactionMsg::Check) | Err(crossbeam_channel::RecvTimeoutError::Timeout) => {}
        }
        let job = {
            let vs = versions.lock();
            vs.pick_compaction(&opts)
        };
        if let Some(job) = job {
            // Read before touching any input so a snapshot taken during the
            // compaction can only be newer than this bound.
            let oldest_snapshot = snapshots.oldest();
            if let Err(e) = run_compaction(&opts, &versions, job, oldest_snapshot) {
                eprintln!("spindle: compaction error: {e}");
            }
        }
    }
}

/// Merge `job.inputs` into one output table.
///
/// `oldest_snapshot` is the oldest sequence any reader may still request. For
/// each user key we keep every version newer than it, plus the newest version
/// at or below it; anything older is shadowed for every possible reader.
fn run_compaction(
    opts: &Options,
    versions: &Arc<Mutex<VersionSet>>,
    job: CompactionJob,
    oldest_snapshot: SequenceNumber,
) -> Result<()> {
    // Collect all internal keys from inputs, merge, drop obsolete.
    let mut iters: Vec<Vec<(InternalKey, Vec<u8>)>> = Vec::new();
    {
        let vs = versions.lock();
        for meta in &job.inputs {
            let table = vs.get_table(meta)?;
            let mut rows = Vec::new();
            for item in table.iter()? {
                let (k, v) = item?;
                rows.push((k, v));
            }
            iters.push(rows);
        }
    }

    let merged = merge_internal_keys(iters);
    let bottom_level = job.output_level as usize == crate::version::NUM_LEVELS - 1;
    let mut compacted: Vec<(InternalKey, Vec<u8>)> = Vec::new();
    let mut current_key: Option<Vec<u8>> = None;
    let mut newer_seq: Option<SequenceNumber> = None;
    for (k, v) in merged {
        if current_key.as_ref() != Some(&k.user_key) {
            current_key = Some(k.user_key.clone());
            newer_seq = None;
        }
        // Hidden by a newer version that every reader can already see.
        let shadowed = newer_seq.is_some_and(|newer| newer <= oldest_snapshot);
        newer_seq = Some(k.sequence);
        if shadowed {
            continue;
        }
        // A tombstone may only vanish at the bottom level, and only once no
        // reader needs the older versions it hides (those were dropped above).
        if k.value_type == ValueType::Deletion && bottom_level && k.sequence <= oldest_snapshot {
            continue;
        }
        compacted.push((k, v));
    }

    let mut outputs = Vec::new();
    let mut vs = versions.lock();
    if !compacted.is_empty() {
        let number = vs.allocate_file_number();
        let path = sstable_path(&opts.path, number);
        let mut builder = TableBuilder::new(path, opts.block_size, opts.bloom_bits_per_key)?;
        for (k, v) in &compacted {
            builder.add(&k.encode(), v)?;
        }
        let meta = builder.finish()?;
        outputs.push(FileMeta {
            number,
            level: job.output_level,
            file_size: meta.file_size,
            smallest: meta.smallest_user_key,
            largest: meta.largest_user_key,
            path: meta.path,
        });
    }
    vs.apply_compaction(job.level, &job.remove, outputs)?;

    // Unlink removed files (still under the lock, so readers never see a
    // version that references a deleted file).
    for n in &job.remove {
        let p = sstable_path(&opts.path, *n);
        let _ = std::fs::remove_file(p);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::version::NUM_LEVELS;
    use tempfile::tempdir;

    /// "No snapshots": everything shadowed by a newer version is garbage.
    const NO_SNAPSHOT: SequenceNumber = SequenceNumber::MAX;

    type Row<'a> = (&'a str, u64, Option<&'a str>);

    /// Write `rows` (already in internal order) as an SSTable at `level`.
    fn add_table(opts: &Options, vs: &Arc<Mutex<VersionSet>>, level: u32, rows: &[Row]) -> u64 {
        let mut vs = vs.lock();
        let number = vs.allocate_file_number();
        let mut b =
            TableBuilder::new(sstable_path(&opts.path, number), opts.block_size, 10).unwrap();
        for (k, seq, v) in rows {
            let t = if v.is_some() {
                ValueType::Value
            } else {
                ValueType::Deletion
            };
            let ik = InternalKey::new(k.as_bytes().to_vec(), *seq, t);
            b.add(&ik.encode(), v.unwrap_or("").as_bytes()).unwrap();
        }
        let m = b.finish().unwrap();
        vs.add_file(FileMeta {
            number,
            level,
            file_size: m.file_size,
            smallest: m.smallest_user_key,
            largest: m.largest_user_key,
            path: m.path,
        })
        .unwrap();
        number
    }

    fn level_rows(vs: &Arc<Mutex<VersionSet>>, level: usize) -> Vec<(String, u64, bool)> {
        let vs = vs.lock();
        let v = vs.current().read().clone();
        let mut out = Vec::new();
        for meta in &v.files[level] {
            for item in vs.get_table(meta).unwrap().iter().unwrap() {
                let (k, _) = item.unwrap();
                out.push((
                    String::from_utf8(k.user_key).unwrap(),
                    k.sequence,
                    k.value_type == ValueType::Deletion,
                ));
            }
        }
        out
    }

    fn setup() -> (tempfile::TempDir, Options, Arc<Mutex<VersionSet>>) {
        let dir = tempdir().unwrap();
        let mut opts = Options::new(dir.path());
        opts.block_size = 64;
        let vs = Arc::new(Mutex::new(VersionSet::open(&opts).unwrap()));
        (dir, opts, vs)
    }

    fn sst_files(opts: &Options) -> usize {
        std::fs::read_dir(&opts.path)
            .unwrap()
            .filter(|e| {
                e.as_ref()
                    .unwrap()
                    .path()
                    .extension()
                    .is_some_and(|x| x == "sst")
            })
            .count()
    }

    #[test]
    fn l0_to_l1_keeps_newest_version_and_tombstones() {
        let (_d, opts, vs) = setup();
        add_table(&opts, &vs, 0, &[("a", 1, Some("a1")), ("b", 2, Some("b2"))]);
        add_table(&opts, &vs, 0, &[("a", 3, Some("a3")), ("c", 4, Some("c4"))]);
        add_table(&opts, &vs, 0, &[("b", 5, None)]);
        add_table(&opts, &vs, 0, &[("a", 7, Some("a7")), ("a", 6, None)]);

        let job = vs.lock().pick_compaction(&opts).expect("L0 trigger");
        run_compaction(&opts, &vs, job, NO_SNAPSHOT).unwrap();

        assert!(vs.lock().current().read().files[0].is_empty());
        assert_eq!(
            level_rows(&vs, 1),
            vec![
                ("a".into(), 7, false),
                // Tombstone kept: L1 is not the bottom level.
                ("b".into(), 5, true),
                ("c".into(), 4, false),
            ]
        );
        assert_eq!(sst_files(&opts), 1, "replaced inputs must be unlinked");
    }

    #[test]
    fn bottom_level_drops_tombstones() {
        let (_d, mut opts, vs) = setup();
        opts.level_base_bytes = 0; // any non-empty level is over target
        let lvl = (NUM_LEVELS - 2) as u32;
        add_table(&opts, &vs, lvl, &[("a", 2, None), ("b", 1, Some("b"))]);

        let job = vs.lock().pick_compaction(&opts).unwrap();
        assert_eq!(job.output_level as usize, NUM_LEVELS - 1);
        run_compaction(&opts, &vs, job, NO_SNAPSHOT).unwrap();
        assert_eq!(
            level_rows(&vs, NUM_LEVELS - 1),
            vec![("b".into(), 1, false)]
        );
        assert_eq!(sst_files(&opts), 1);
    }

    #[test]
    fn all_tombstones_at_bottom_leave_no_files() {
        let (_d, mut opts, vs) = setup();
        opts.level_base_bytes = 0;
        add_table(&opts, &vs, (NUM_LEVELS - 2) as u32, &[("a", 1, None)]);

        let job = vs.lock().pick_compaction(&opts).unwrap();
        run_compaction(&opts, &vs, job, NO_SNAPSHOT).unwrap();
        let v = vs.lock().current().read().clone();
        assert!(v.files.iter().all(|l| l.is_empty()));
        assert_eq!(
            sst_files(&opts),
            0,
            "inputs must be unlinked even with no output"
        );
    }

    /// Versions a live snapshot can see must survive; older ones must not.
    #[test]
    fn keeps_versions_needed_by_the_oldest_snapshot() {
        let (_d, opts, vs) = setup();
        add_table(&opts, &vs, 0, &[("k", 9, Some("v9")), ("k", 7, Some("v7"))]);
        add_table(&opts, &vs, 0, &[("k", 5, Some("v5")), ("k", 3, Some("v3"))]);
        add_table(&opts, &vs, 0, &[("k", 2, Some("v2"))]);
        add_table(&opts, &vs, 0, &[("k", 1, Some("v1"))]);

        let job = vs.lock().pick_compaction(&opts).unwrap();
        // A reader pinned at 6 needs v5 (newest <= 6) and everything newer.
        run_compaction(&opts, &vs, job, 6).unwrap();
        assert_eq!(
            level_rows(&vs, 1),
            vec![
                ("k".into(), 9, false),
                ("k".into(), 7, false),
                ("k".into(), 5, false),
            ]
        );
    }

    /// A tombstone at the bottom level must outlive a snapshot older than it,
    /// otherwise the value it hides would come back for newer readers.
    #[test]
    fn bottom_tombstone_waits_for_snapshots() {
        let (_d, mut opts, vs) = setup();
        opts.level_base_bytes = 0;
        let lvl = (NUM_LEVELS - 2) as u32;
        add_table(&opts, &vs, lvl, &[("k", 8, None), ("k", 3, Some("old"))]);

        // Snapshot at 5 still needs "old"; the tombstone (8) must stay too.
        let job = vs.lock().pick_compaction(&opts).unwrap();
        run_compaction(&opts, &vs, job, 5).unwrap();
        assert_eq!(
            level_rows(&vs, NUM_LEVELS - 1),
            vec![("k".into(), 8, true), ("k".into(), 3, false)]
        );

        // Once the snapshot is gone both can go.
        opts.level_base_bytes = 0;
        let job = vs.lock().pick_compaction(&opts);
        assert!(job.is_none(), "bottom level is never compacted further");
    }

    #[test]
    fn worker_compacts_on_request_and_stops() {
        let (_d, opts, vs) = setup();
        for i in 0..4u64 {
            add_table(&opts, &vs, 0, &[("k", i + 1, Some("v"))]);
        }
        let handle = spawn_compaction(
            opts.clone(),
            Arc::clone(&vs),
            Arc::new(SnapshotList::new(Arc::new(
                std::sync::atomic::AtomicU64::new(100),
            ))),
        );
        handle.request_check();
        let mut done = false;
        for _ in 0..200 {
            if vs.lock().current().read().files[0].is_empty() {
                done = true;
                break;
            }
            std::thread::sleep(Duration::from_millis(10));
        }
        handle.stop();
        assert!(done, "background compaction did not run");
        assert_eq!(level_rows(&vs, 1), vec![("k".into(), 4, false)]);
    }
}
