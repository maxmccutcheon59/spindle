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
use crate::keys::{InternalKey, ValueType};
use crate::options::Options;
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

pub fn spawn_compaction(opts: Options, versions: Arc<Mutex<VersionSet>>) -> CompactionHandle {
    let (tx, rx) = crossbeam_channel::unbounded();
    let stop = Arc::new(AtomicBool::new(false));
    let stop2 = Arc::clone(&stop);
    let join = thread::Builder::new()
        .name("spindle-compact".into())
        .spawn(move || worker(opts, versions, rx, stop2))
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
            if let Err(e) = run_compaction(&opts, &versions, job) {
                eprintln!("spindle: compaction error: {e}");
            }
        }
    }
}

fn run_compaction(
    opts: &Options,
    versions: &Arc<Mutex<VersionSet>>,
    job: CompactionJob,
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
    // Drop older versions of the same user key (compaction for full
    // snapshot retention would keep keys ≥ oldest snapshot; we keep
    // only the newest for simplicity — see DESIGN.md MVCC section).
    let mut compacted: Vec<(InternalKey, Vec<u8>)> = Vec::new();
    let mut last_user: Option<Vec<u8>> = None;
    for (k, v) in merged {
        if last_user.as_ref() == Some(&k.user_key) {
            continue;
        }
        last_user = Some(k.user_key.clone());
        // Drop tombstones that don't need to cover lower levels when
        // compacting into the bottom-most relevant range — keep them
        // unless this is the last level.
        if k.value_type == ValueType::Deletion
            && job.output_level as usize == crate::version::NUM_LEVELS - 1
        {
            continue;
        }
        compacted.push((k, v));
    }

    if compacted.is_empty() {
        let mut vs = versions.lock();
        vs.apply_compaction(job.level, &job.remove, Vec::new())?;
        return Ok(());
    }

    let mut outputs = Vec::new();
    let mut vs = versions.lock();
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
    vs.apply_compaction(job.level, &job.remove, outputs)?;

    // Unlink removed files.
    for n in &job.remove {
        let p = sstable_path(&opts.path, *n);
        let _ = std::fs::remove_file(p);
    }
    Ok(())
}
