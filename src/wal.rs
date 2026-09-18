//! Write-ahead log.
//!
//! Every acknowledged mutation is appended here *before* it is applied to
//! the memtable. On open we replay the WAL to reconstruct the memtable.
//!
//! # Record format
//!
//! ```text
//! [crc32: u32 LE][len: u32 LE][payload...]
//! payload = [type: u8][seq: u64 LE][klen: u32 LE][key...][vlen: u32 LE][val...]
//! type: 1 = Put, 2 = Delete
//! ```
//!
//! # fsync policy
//!
//! See [`crate::SyncPolicy`]. Default is `EveryWrite`: we call
//! `File::sync_data` after each append and only then return `Ok` to the
//! caller. That means:
//!
//! - Die *before* sync returns → write was never acknowledged; OK to lose.
//! - Die *after* sync, *before* memtable insert → replay restores it.
//! - Die *after* memtable insert → already durable via WAL.
//!
//! Group commit trades latency for throughput by delaying sync up to
//! `group_commit_ms` so multiple writers share one barrier.

use std::fs::{self, File, OpenOptions};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

use crate::error::{Error, Result};
use crate::keys::{InternalKey, SequenceNumber, ValueType};
use crate::options::SyncPolicy;

const WAL_PUT: u8 = 1;
const WAL_DELETE: u8 = 2;

/// An open WAL file ready for appends.
pub struct Wal {
    file: File,
    sync: SyncPolicy,
    /// Last time we synced, for group commit.
    last_sync: Instant,
    /// Bytes written since last sync.
    dirty: bool,
}

impl Wal {
    pub fn create(dir: &Path, number: u64, sync: SyncPolicy) -> Result<Self> {
        fs::create_dir_all(dir)?;
        let path = wal_path(dir, number);
        let file = OpenOptions::new()
            .create(true)
            .truncate(true)
            .read(true)
            .write(true)
            .open(&path)?;
        Ok(Self {
            file,
            sync,
            last_sync: Instant::now(),
            dirty: false,
        })
    }

    pub fn open_existing(dir: &Path, number: u64, sync: SyncPolicy) -> Result<Self> {
        let path = wal_path(dir, number);
        let file = OpenOptions::new().read(true).append(true).open(&path)?;
        Ok(Self {
            file,
            sync,
            last_sync: Instant::now(),
            dirty: false,
        })
    }

    pub fn append_put(&mut self, seq: SequenceNumber, key: &[u8], value: &[u8]) -> Result<()> {
        self.append_record(WAL_PUT, seq, key, value)
    }

    pub fn append_delete(&mut self, seq: SequenceNumber, key: &[u8]) -> Result<()> {
        self.append_record(WAL_DELETE, seq, key, &[])
    }

    fn append_record(
        &mut self,
        ty: u8,
        seq: SequenceNumber,
        key: &[u8],
        value: &[u8],
    ) -> Result<()> {
        let mut payload = Vec::with_capacity(1 + 8 + 4 + key.len() + 4 + value.len());
        payload.push(ty);
        payload.extend_from_slice(&seq.to_le_bytes());
        payload.extend_from_slice(&(key.len() as u32).to_le_bytes());
        payload.extend_from_slice(key);
        payload.extend_from_slice(&(value.len() as u32).to_le_bytes());
        payload.extend_from_slice(value);

        let crc = crc32fast::hash(&payload);
        self.file.write_all(&crc.to_le_bytes())?;
        self.file.write_all(&(payload.len() as u32).to_le_bytes())?;
        self.file.write_all(&payload)?;
        self.dirty = true;
        self.maybe_sync()?;
        Ok(())
    }

    fn maybe_sync(&mut self) -> Result<()> {
        match self.sync {
            SyncPolicy::EveryWrite => {
                self.file.sync_data()?;
                self.dirty = false;
                self.last_sync = Instant::now();
            }
            SyncPolicy::GroupCommit { group_commit_ms } => {
                let due = self.last_sync.elapsed() >= Duration::from_millis(group_commit_ms);
                if due && self.dirty {
                    self.file.sync_data()?;
                    self.dirty = false;
                    self.last_sync = Instant::now();
                }
            }
        }
        Ok(())
    }

    /// Force a sync regardless of policy (used on close / flush).
    pub fn sync(&mut self) -> Result<()> {
        if self.dirty {
            self.file.sync_data()?;
            self.dirty = false;
            self.last_sync = Instant::now();
        }
        Ok(())
    }
}

/// Replay all complete records from a WAL file.
pub fn replay(path: &Path) -> Result<Vec<WalRecord>> {
    let mut file = match File::open(path) {
        Ok(f) => f,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(Vec::new()),
        Err(e) => return Err(e.into()),
    };
    let mut buf = Vec::new();
    file.read_to_end(&mut buf)?;

    let mut out = Vec::new();
    let mut i = 0usize;
    while i + 8 <= buf.len() {
        let crc = u32::from_le_bytes(buf[i..i + 4].try_into().unwrap());
        let len = u32::from_le_bytes(buf[i + 4..i + 8].try_into().unwrap()) as usize;
        i += 8;
        if i + len > buf.len() {
            // Torn write at end of file — stop. Prior complete records
            // remain valid; this is the crash-recovery contract.
            break;
        }
        let payload = &buf[i..i + len];
        if crc32fast::hash(payload) != crc {
            return Err(Error::Corruption(format!(
                "WAL CRC mismatch at offset {}",
                i - 8
            )));
        }
        out.push(decode_payload(payload)?);
        i += len;
    }
    Ok(out)
}

fn decode_payload(payload: &[u8]) -> Result<WalRecord> {
    if payload.len() < 1 + 8 + 4 + 4 {
        return Err(Error::Corruption("WAL record too short".into()));
    }
    let ty = payload[0];
    let seq = u64::from_le_bytes(payload[1..9].try_into().unwrap());
    let mut o = 9;
    let klen = u32::from_le_bytes(payload[o..o + 4].try_into().unwrap()) as usize;
    o += 4;
    if o + klen + 4 > payload.len() {
        return Err(Error::Corruption("WAL key truncated".into()));
    }
    let key = payload[o..o + klen].to_vec();
    o += klen;
    let vlen = u32::from_le_bytes(payload[o..o + 4].try_into().unwrap()) as usize;
    o += 4;
    if o + vlen != payload.len() {
        return Err(Error::Corruption("WAL value truncated".into()));
    }
    let value = payload[o..o + vlen].to_vec();
    match ty {
        WAL_PUT => Ok(WalRecord {
            key: InternalKey::new(key, seq, ValueType::Value),
            value,
        }),
        WAL_DELETE => Ok(WalRecord {
            key: InternalKey::new(key, seq, ValueType::Deletion),
            value: Vec::new(),
        }),
        _ => Err(Error::Corruption(format!("unknown WAL type {ty}"))),
    }
}

/// One recovered mutation.
#[derive(Debug, Clone)]
pub struct WalRecord {
    pub key: InternalKey,
    pub value: Vec<u8>,
}

pub fn wal_path(dir: &Path, number: u64) -> PathBuf {
    dir.join(format!("{number:06}.log"))
}

pub fn list_wal_numbers(dir: &Path) -> Result<Vec<u64>> {
    let mut nums = Vec::new();
    if !dir.exists() {
        return Ok(nums);
    }
    for ent in fs::read_dir(dir)? {
        let ent = ent?;
        let name = ent.file_name();
        let name = name.to_string_lossy();
        if let Some(n) = name.strip_suffix(".log") {
            if let Ok(num) = n.parse::<u64>() {
                nums.push(num);
            }
        }
    }
    nums.sort_unstable();
    Ok(nums)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn append_and_replay() {
        let dir = tempdir().unwrap();
        let mut wal = Wal::create(dir.path(), 1, SyncPolicy::EveryWrite).unwrap();
        wal.append_put(1, b"a", b"1").unwrap();
        wal.append_put(2, b"b", b"2").unwrap();
        wal.append_delete(3, b"a").unwrap();
        drop(wal);

        let recs = replay(&wal_path(dir.path(), 1)).unwrap();
        assert_eq!(recs.len(), 3);
        assert_eq!(recs[0].key.user_key, b"a");
        assert_eq!(recs[2].key.value_type, ValueType::Deletion);
    }

    #[test]
    fn torn_tail_is_truncated_not_fatal() {
        let dir = tempdir().unwrap();
        let path = wal_path(dir.path(), 1);
        let mut wal = Wal::create(dir.path(), 1, SyncPolicy::EveryWrite).unwrap();
        wal.append_put(1, b"ok", b"1").unwrap();
        drop(wal);
        // Append garbage / partial record.
        let mut f = OpenOptions::new().append(true).open(&path).unwrap();
        f.write_all(&[0xde, 0xad, 0xbe]).unwrap();
        let recs = replay(&path).unwrap();
        assert_eq!(recs.len(), 1);
    }
}
