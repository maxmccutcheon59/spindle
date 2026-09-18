//! Top-level database handle.

use std::fs;
use std::path::Path;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;

use parking_lot::{Mutex, RwLock};

use crate::compaction::{self, CompactionHandle};
use crate::error::Result;
use crate::iterator::{scan_range, KvIter};
use crate::keys::{InternalKey, LookupKey, SequenceNumber, ValueType};
use crate::memtable::{MemGet, MemTable};
use crate::options::Options;
use crate::sstable::{TableBuilder, TableGet};
use crate::version::{sstable_path, FileMeta, VersionSet};
use crate::wal::{self, Wal};

/// MVCC read snapshot: all keys with `sequence <= seq` are visible.
#[derive(Debug, Clone, Copy)]
pub struct Snapshot {
    pub(crate) sequence: SequenceNumber,
}

/// An open Spindle database.
pub struct Db {
    opts: Options,
    inner: Arc<DbInner>,
    compaction: Option<CompactionHandle>,
}

struct DbInner {
    /// Protects memtable swap, WAL, and sequence allocation.
    write: Mutex<WriteState>,
    /// Active memtable published for readers.
    mem: RwLock<Arc<MemTable>>,
    /// Immutable memtables waiting for flush (newest first).
    imms: RwLock<Vec<Arc<MemTable>>>,
    versions: Arc<Mutex<VersionSet>>,
    last_sequence: AtomicU64,
}

struct WriteState {
    wal: Wal,
    wal_number: u64,
    mem: MemTable,
}

impl Db {
    /// Open or create a database at `opts.path`.
    pub fn open(opts: Options) -> Result<Self> {
        fs::create_dir_all(&opts.path)?;
        let mut versions = VersionSet::open(&opts)?;

        // Replay WALs into a recovered memtable.
        let mut recovered = MemTable::new();
        let wal_nums = wal::list_wal_numbers(&opts.path)?;
        let mut max_seq = versions.last_sequence;
        for num in &wal_nums {
            for rec in wal::replay(&wal::wal_path(&opts.path, *num))? {
                max_seq = max_seq.max(rec.key.sequence);
                recovered.add(rec.key, rec.value);
            }
        }
        versions.last_sequence = max_seq;

        let (wal, wal_number) = if let Some(&newest) = wal_nums.last() {
            match Wal::open_existing(&opts.path, newest, opts.sync) {
                Ok(w) => (w, newest),
                Err(_) => {
                    let n = versions.allocate_file_number();
                    (Wal::create(&opts.path, n, opts.sync)?, n)
                }
            }
        } else {
            let n = versions.allocate_file_number();
            (Wal::create(&opts.path, n, opts.sync)?, n)
        };

        // Readers and writers share the same recovered contents at open.
        let mut write_mem = MemTable::new();
        for (k, v) in recovered.iter() {
            write_mem.add(k.clone(), v.clone());
        }
        let published = Arc::new({
            let mut m = MemTable::new();
            for (k, v) in write_mem.iter() {
                m.add(k.clone(), v.clone());
            }
            m
        });

        let inner = Arc::new(DbInner {
            write: Mutex::new(WriteState {
                wal,
                wal_number,
                mem: write_mem,
            }),
            mem: RwLock::new(published),
            imms: RwLock::new(Vec::new()),
            versions: Arc::new(Mutex::new(versions)),
            last_sequence: AtomicU64::new(max_seq),
        });

        let compaction = if opts.disable_compaction {
            None
        } else {
            Some(compaction::spawn_compaction(
                opts.clone(),
                Arc::clone(&inner.versions),
            ))
        };

        Ok(Self {
            opts,
            inner,
            compaction,
        })
    }

    /// Latest sequence number (for diagnostics).
    pub fn last_sequence(&self) -> SequenceNumber {
        self.inner.last_sequence.load(Ordering::Acquire)
    }

    /// Create a read snapshot pinned at the current sequence.
    pub fn snapshot(&self) -> Snapshot {
        Snapshot {
            sequence: self.last_sequence(),
        }
    }

    /// Put a key/value. Durable per [`SyncPolicy`] before returning Ok.
    pub fn put(&self, key: &[u8], value: &[u8]) -> Result<()> {
        self.write(key, Some(value))
    }

    /// Delete a key (tombstone).
    pub fn delete(&self, key: &[u8]) -> Result<()> {
        self.write(key, None)
    }

    fn write(&self, key: &[u8], value: Option<&[u8]>) -> Result<()> {
        let mut w = self.inner.write.lock();
        let seq = self.inner.last_sequence.fetch_add(1, Ordering::AcqRel) + 1;

        // 1. WAL first — durability boundary.
        match value {
            Some(v) => w.wal.append_put(seq, key, v)?,
            None => w.wal.append_delete(seq, key)?,
        }

        // 2. Memtable.
        let ik = InternalKey::new(
            key.to_vec(),
            seq,
            if value.is_some() {
                ValueType::Value
            } else {
                ValueType::Deletion
            },
        );
        w.mem.add(ik, value.unwrap_or_default().to_vec());
        self.publish_mem(&w.mem);

        // 3. Maybe flush.
        if w.mem.approx_bytes() >= self.opts.write_buffer_size {
            self.rotate_memtable(&mut w)?;
        }
        Ok(())
    }

    fn publish_mem(&self, mem: &MemTable) {
        let mut published = MemTable::new();
        for (k, v) in mem.iter() {
            published.add(k.clone(), v.clone());
        }
        *self.inner.mem.write() = Arc::new(published);
    }

    fn rotate_memtable(&self, w: &mut WriteState) -> Result<()> {
        let mut frozen = MemTable::new();
        std::mem::swap(&mut frozen, &mut w.mem);
        let frozen = Arc::new(frozen);
        self.inner.imms.write().insert(0, Arc::clone(&frozen));
        *self.inner.mem.write() = Arc::new(MemTable::new());

        let new_num = {
            let mut vs = self.inner.versions.lock();
            vs.allocate_file_number()
        };
        let old_wal_number = w.wal_number;
        w.wal.sync()?;
        w.wal = Wal::create(&self.opts.path, new_num, self.opts.sync)?;
        w.wal_number = new_num;

        self.flush_memtable(frozen, old_wal_number)?;

        if let Some(c) = &self.compaction {
            c.request_check();
        }
        Ok(())
    }

    fn flush_memtable(&self, mem: Arc<MemTable>, old_wal_number: u64) -> Result<()> {
        if mem.is_empty() {
            self.inner.imms.write().retain(|m| !Arc::ptr_eq(m, &mem));
            return Ok(());
        }
        let number = {
            let mut vs = self.inner.versions.lock();
            vs.allocate_file_number()
        };
        let path = sstable_path(&self.opts.path, number);
        let mut builder =
            TableBuilder::new(path, self.opts.block_size, self.opts.bloom_bits_per_key)?;
        for (k, v) in mem.iter() {
            builder.add(&k.encode(), v)?;
        }
        let meta = builder.finish()?;
        let file_meta = FileMeta {
            number,
            level: 0,
            file_size: meta.file_size,
            smallest: meta.smallest_user_key,
            largest: meta.largest_user_key,
            path: meta.path,
        };
        {
            let mut vs = self.inner.versions.lock();
            vs.last_sequence = self.last_sequence();
            vs.add_file(file_meta)?;
        }
        self.inner.imms.write().retain(|m| !Arc::ptr_eq(m, &mem));
        let _ = fs::remove_file(wal::wal_path(&self.opts.path, old_wal_number));
        Ok(())
    }

    /// Point lookup at the latest sequence.
    pub fn get(&self, key: &[u8]) -> Result<Option<Vec<u8>>> {
        self.get_at(key, self.last_sequence())
    }

    /// Point lookup under a snapshot.
    pub fn get_snapshot(&self, key: &[u8], snap: Snapshot) -> Result<Option<Vec<u8>>> {
        self.get_at(key, snap.sequence)
    }

    fn get_at(&self, key: &[u8], seq: SequenceNumber) -> Result<Option<Vec<u8>>> {
        let lookup = LookupKey::new(key, seq);

        {
            let mem = self.inner.mem.read();
            match mem.get(&lookup) {
                MemGet::Found(v) => return Ok(Some(v)),
                MemGet::Deleted => return Ok(None),
                MemGet::NotFound => {}
            }
        }

        {
            let imms = self.inner.imms.read();
            for mt in imms.iter() {
                match mt.get(&lookup) {
                    MemGet::Found(v) => return Ok(Some(v)),
                    MemGet::Deleted => return Ok(None),
                    MemGet::NotFound => {}
                }
            }
        }

        let version = {
            let vs = self.inner.versions.lock();
            vs.current().read().clone()
        };
        let metas: Vec<FileMeta> = version
            .all_tables_newest_first()
            .into_iter()
            .cloned()
            .collect();
        let vs = self.inner.versions.lock();
        for meta in &metas {
            let table = vs.get_table(meta)?;
            match table.get(&lookup)? {
                TableGet::Found(v) => return Ok(Some(v)),
                TableGet::Deleted => return Ok(None),
                TableGet::NotFound => {}
            }
        }
        Ok(None)
    }

    /// Range scan `[start, end)` at the latest sequence.
    pub fn scan(&self, start: Option<&[u8]>, end: Option<&[u8]>) -> Result<KvIter> {
        self.scan_at(start, end, self.last_sequence())
    }

    /// Range scan under a snapshot.
    pub fn scan_snapshot(
        &self,
        start: Option<&[u8]>,
        end: Option<&[u8]>,
        snap: Snapshot,
    ) -> Result<KvIter> {
        self.scan_at(start, end, snap.sequence)
    }

    fn scan_at(
        &self,
        start: Option<&[u8]>,
        end: Option<&[u8]>,
        seq: SequenceNumber,
    ) -> Result<KvIter> {
        let mem = Arc::clone(&self.inner.mem.read());
        let imms = self.inner.imms.read().clone();
        let tables = {
            let version = self.inner.versions.lock().current().read().clone();
            let metas: Vec<FileMeta> = version
                .all_tables_newest_first()
                .into_iter()
                .cloned()
                .collect();
            let vs = self.inner.versions.lock();
            let mut out = Vec::new();
            for meta in &metas {
                out.push(vs.get_table(meta)?);
            }
            out
        };
        scan_range(&mem, &imms, &tables, start, end, seq)
    }

    /// Force memtable flush (tests / benchmarks).
    pub fn flush(&self) -> Result<()> {
        let mut w = self.inner.write.lock();
        if !w.mem.is_empty() {
            self.rotate_memtable(&mut w)?;
        }
        Ok(())
    }

    /// Database directory.
    pub fn path(&self) -> &Path {
        &self.opts.path
    }
}

impl Drop for Db {
    fn drop(&mut self) {
        if let Some(c) = self.compaction.take() {
            c.stop();
        }
        if let Some(mut w) = self.inner.write.try_lock() {
            let _ = w.wal.sync();
        }
    }
}

/// Convenience: open with default options at `path`.
pub fn open(path: impl AsRef<Path>) -> Result<Db> {
    Db::open(Options::new(path.as_ref()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::options::SyncPolicy;
    use tempfile::tempdir;

    fn test_opts(dir: &Path) -> Options {
        let mut o = Options::new(dir);
        o.write_buffer_size = 1024;
        o.disable_compaction = true;
        o.sync = SyncPolicy::EveryWrite;
        o
    }

    #[test]
    fn convenience_open() {
        let dir = tempdir().unwrap();
        let db = crate::open(dir.path()).unwrap();
        db.put(b"k", b"v").unwrap();
        assert_eq!(db.get(b"k").unwrap().as_deref(), Some(b"v".as_slice()));
    }

    #[test]
    fn put_get_delete_persist() {
        let dir = tempdir().unwrap();
        {
            let db = Db::open(test_opts(dir.path())).unwrap();
            db.put(b"a", b"1").unwrap();
            db.put(b"b", b"2").unwrap();
            db.delete(b"a").unwrap();
            assert_eq!(db.get(b"a").unwrap(), None);
            assert_eq!(db.get(b"b").unwrap(), Some(b"2".to_vec()));
        }
        let db = Db::open(test_opts(dir.path())).unwrap();
        assert_eq!(db.get(b"a").unwrap(), None);
        assert_eq!(db.get(b"b").unwrap(), Some(b"2".to_vec()));
    }

    #[test]
    fn flush_to_sstable_and_read() {
        let dir = tempdir().unwrap();
        let db = Db::open(test_opts(dir.path())).unwrap();
        for i in 0..50u32 {
            db.put(format!("k{i:03}").as_bytes(), format!("v{i}").as_bytes())
                .unwrap();
        }
        db.flush().unwrap();
        assert_eq!(db.get(b"k025").unwrap().as_deref(), Some(b"v25".as_slice()));
    }

    #[test]
    fn snapshot_mvcc() {
        let dir = tempdir().unwrap();
        let mut o = test_opts(dir.path());
        o.write_buffer_size = 1 << 20;
        let db = Db::open(o).unwrap();
        db.put(b"x", b"old").unwrap();
        let snap = db.snapshot();
        db.put(b"x", b"new").unwrap();
        assert_eq!(db.get(b"x").unwrap().as_deref(), Some(b"new".as_slice()));
        assert_eq!(
            db.get_snapshot(b"x", snap).unwrap().as_deref(),
            Some(b"old".as_slice())
        );
    }

    #[test]
    fn range_scan() {
        let dir = tempdir().unwrap();
        let mut o = test_opts(dir.path());
        o.write_buffer_size = 1 << 20;
        let db = Db::open(o).unwrap();
        for k in [b"a" as &[u8], b"b", b"c", b"d"] {
            db.put(k, k).unwrap();
        }
        db.delete(b"c").unwrap();
        let got: Vec<_> = db
            .scan(Some(b"b"), Some(b"d"))
            .unwrap()
            .map(|p| p.key)
            .collect();
        assert_eq!(got, vec![b"b".to_vec()]);
    }
}
