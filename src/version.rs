//! Version set: which SSTables live at which level.
//!
//! Level 0 files may overlap. Levels ≥ 1 are non-overlapping and sorted
//! by key range. Target size for level L is
//! `level_base_bytes * level_size_multiplier^(L-1)`.

use std::collections::HashMap;
use std::fs::{self, File, OpenOptions};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::sync::Arc;

use parking_lot::RwLock;

use crate::error::{Error, Result};
use crate::options::Options;
use crate::sstable::{self, Table};

pub const NUM_LEVELS: usize = 7;

/// Metadata for one SSTable in the version set.
#[derive(Debug, Clone)]
pub struct FileMeta {
    pub number: u64,
    pub level: u32,
    pub file_size: u64,
    pub smallest: Vec<u8>,
    pub largest: Vec<u8>,
    pub path: PathBuf,
}

/// Immutable snapshot of the LSM file set.
#[derive(Debug, Clone, Default)]
pub struct Version {
    pub files: Vec<Vec<FileMeta>>,
}

impl Version {
    pub fn new() -> Self {
        Self {
            files: (0..NUM_LEVELS).map(|_| Vec::new()).collect(),
        }
    }

    pub fn level_bytes(&self, level: usize) -> u64 {
        self.files
            .get(level)
            .map(|f| f.iter().map(|m| m.file_size).sum())
            .unwrap_or(0)
    }

    pub fn all_tables_newest_first(&self) -> Vec<&FileMeta> {
        let mut out = Vec::new();
        // L0 newest-first (higher file number ≈ newer), then L1…Ln.
        let mut l0: Vec<&FileMeta> = self.files[0].iter().collect();
        l0.sort_by_key(|m| std::cmp::Reverse(m.number));
        out.extend(l0);
        for level in 1..NUM_LEVELS {
            out.extend(self.files[level].iter());
        }
        out
    }
}

/// Manages CURRENT / MANIFEST and the live [`Version`].
pub struct VersionSet {
    dir: PathBuf,
    pub next_file_number: u64,
    pub last_sequence: u64,
    version: Arc<RwLock<Version>>,
    tables: RwLock<HashMap<u64, Arc<Table>>>,
    manifest_number: u64,
}

impl VersionSet {
    pub fn open(opts: &Options) -> Result<Self> {
        fs::create_dir_all(&opts.path)?;
        let mut vs = Self {
            dir: opts.path.clone(),
            next_file_number: 1,
            last_sequence: 0,
            version: Arc::new(RwLock::new(Version::new())),
            tables: RwLock::new(HashMap::new()),
            manifest_number: 1,
        };
        if let Some(manifest) = read_current(&opts.path)? {
            vs.manifest_number = manifest;
            vs.recover_manifest(&manifest_path(&opts.path, manifest))?;
        }
        Ok(vs)
    }

    pub fn current(&self) -> Arc<RwLock<Version>> {
        Arc::clone(&self.version)
    }

    pub fn allocate_file_number(&mut self) -> u64 {
        let n = self.next_file_number;
        self.next_file_number += 1;
        n
    }

    pub fn get_table(&self, meta: &FileMeta) -> Result<Arc<Table>> {
        {
            let guard = self.tables.read();
            if let Some(t) = guard.get(&meta.number) {
                return Ok(Arc::clone(t));
            }
        }
        let table = Arc::new(Table::open(&meta.path)?);
        self.tables.write().insert(meta.number, Arc::clone(&table));
        Ok(table)
    }

    pub fn add_file(&mut self, meta: FileMeta) -> Result<()> {
        {
            let mut v = self.version.write();
            let level = meta.level as usize;
            if level >= NUM_LEVELS {
                return Err(Error::InvalidArgument(format!("level {level} too high")));
            }
            v.files[level].push(meta.clone());
            if level >= 1 {
                v.files[level].sort_by(|a, b| a.smallest.cmp(&b.smallest));
            }
        }
        self.persist()?;
        Ok(())
    }

    pub fn apply_compaction(
        &mut self,
        level: u32,
        remove: &[u64],
        add: Vec<FileMeta>,
    ) -> Result<()> {
        {
            let mut v = self.version.write();
            let remove_set: std::collections::HashSet<u64> = remove.iter().copied().collect();
            for files in &mut v.files {
                files.retain(|f| !remove_set.contains(&f.number));
            }
            for meta in add {
                let lvl = meta.level as usize;
                v.files[lvl].push(meta);
                if lvl >= 1 {
                    v.files[lvl].sort_by(|a, b| a.smallest.cmp(&b.smallest));
                }
            }
            let _ = level;
        }
        // Drop closed tables from cache.
        {
            let mut cache = self.tables.write();
            for n in remove {
                cache.remove(n);
            }
        }
        self.persist()?;
        Ok(())
    }

    fn persist(&mut self) -> Result<()> {
        // Write a fresh manifest (monotonic manifest_number).
        self.manifest_number += 1;
        let path = manifest_path(&self.dir, self.manifest_number);
        let version = self.version.read().clone();
        let mut f = File::create(&path)?;
        writeln!(
            f,
            "NEXT {} SEQ {} MANIFEST {}",
            self.next_file_number, self.last_sequence, self.manifest_number
        )?;
        for (level, files) in version.files.iter().enumerate() {
            for meta in files {
                writeln!(
                    f,
                    "FILE {} {} {} {} {} {}",
                    level,
                    meta.number,
                    meta.file_size,
                    hex::encode(&meta.smallest),
                    hex::encode(&meta.largest),
                    meta.path.file_name().unwrap().to_string_lossy()
                )?;
            }
        }
        f.sync_data()?;
        write_current(&self.dir, self.manifest_number)?;
        Ok(())
    }

    fn recover_manifest(&mut self, path: &Path) -> Result<()> {
        let mut s = String::new();
        File::open(path)?.read_to_string(&mut s)?;
        let mut version = Version::new();
        for line in s.lines() {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.is_empty() {
                continue;
            }
            match parts[0] {
                "NEXT" => {
                    self.next_file_number = parts[1].parse().unwrap_or(1);
                    self.last_sequence = parts[3].parse().unwrap_or(0);
                }
                "FILE" => {
                    let level: usize = parts[1].parse().unwrap_or(0);
                    let number: u64 = parts[2].parse().unwrap_or(0);
                    let file_size: u64 = parts[3].parse().unwrap_or(0);
                    let smallest = hex::decode(parts[4]).unwrap_or_default();
                    let largest = hex::decode(parts[5]).unwrap_or_default();
                    let name = parts[6];
                    let meta = FileMeta {
                        number,
                        level: level as u32,
                        file_size,
                        smallest,
                        largest,
                        path: self.dir.join(name),
                    };
                    if level < NUM_LEVELS {
                        version.files[level].push(meta);
                    }
                    if number >= self.next_file_number {
                        self.next_file_number = number + 1;
                    }
                }
                _ => {}
            }
        }
        *self.version.write() = version;
        Ok(())
    }

    pub fn pick_compaction(&self, opts: &Options) -> Option<CompactionJob> {
        let v = self.version.read();
        // Prefer L0 when too many files.
        if v.files[0].len() >= 4 {
            let inputs = v.files[0].clone();
            let (lo, hi) = key_range(&inputs);
            let mut level1 = overlapping(&v.files[1], &lo, &hi);
            let mut remove: Vec<u64> = inputs.iter().map(|f| f.number).collect();
            remove.extend(level1.iter().map(|f| f.number));
            let mut all = inputs;
            all.append(&mut level1);
            return Some(CompactionJob {
                level: 0,
                inputs: all,
                remove,
                output_level: 1,
            });
        }
        for level in 1..NUM_LEVELS - 1 {
            let target = opts.level_base_bytes
                * opts
                    .level_size_multiplier
                    .pow((level as u32).saturating_sub(1));
            if v.level_bytes(level) > target {
                // Compact the oldest / first file in the level.
                let victim = v.files[level].first()?.clone();
                let mut level_next =
                    overlapping(&v.files[level + 1], &victim.smallest, &victim.largest);
                let mut remove = vec![victim.number];
                remove.extend(level_next.iter().map(|f| f.number));
                let mut inputs = vec![victim];
                inputs.append(&mut level_next);
                return Some(CompactionJob {
                    level: level as u32,
                    inputs,
                    remove,
                    output_level: (level + 1) as u32,
                });
            }
        }
        None
    }
}

/// A planned compaction.
#[derive(Debug, Clone)]
pub struct CompactionJob {
    pub level: u32,
    pub inputs: Vec<FileMeta>,
    pub remove: Vec<u64>,
    pub output_level: u32,
}

fn key_range(files: &[FileMeta]) -> (Vec<u8>, Vec<u8>) {
    let mut lo = files[0].smallest.clone();
    let mut hi = files[0].largest.clone();
    for f in files.iter().skip(1) {
        if f.smallest < lo {
            lo = f.smallest.clone();
        }
        if f.largest > hi {
            hi = f.largest.clone();
        }
    }
    (lo, hi)
}

fn overlapping(files: &[FileMeta], lo: &[u8], hi: &[u8]) -> Vec<FileMeta> {
    files
        .iter()
        .filter(|f| f.largest.as_slice() >= lo && f.smallest.as_slice() <= hi)
        .cloned()
        .collect()
}

fn manifest_path(dir: &Path, number: u64) -> PathBuf {
    dir.join(format!("MANIFEST-{number:06}"))
}

fn write_current(dir: &Path, number: u64) -> Result<()> {
    let tmp = dir.join("CURRENT.tmp");
    let mut f = File::create(&tmp)?;
    writeln!(f, "MANIFEST-{number:06}")?;
    f.sync_data()?;
    let current = dir.join("CURRENT");
    fs::rename(tmp, current)?;
    // fsync directory for durability of the rename on Linux.
    let _ = OpenOptions::new()
        .read(true)
        .open(dir)
        .and_then(|d| d.sync_all());
    Ok(())
}

fn read_current(dir: &Path) -> Result<Option<u64>> {
    let path = dir.join("CURRENT");
    if !path.exists() {
        return Ok(None);
    }
    let mut s = String::new();
    File::open(path)?.read_to_string(&mut s)?;
    let name = s.trim();
    let num = name
        .strip_prefix("MANIFEST-")
        .and_then(|n| n.parse().ok())
        .ok_or_else(|| Error::Corruption(format!("bad CURRENT: {name}")))?;
    Ok(Some(num))
}

// Tiny hex helpers so we don't pull in the `hex` crate.
mod hex {
    pub fn encode(bytes: &[u8]) -> String {
        const HEX: &[u8; 16] = b"0123456789abcdef";
        let mut out = String::with_capacity(bytes.len() * 2);
        for &b in bytes {
            out.push(HEX[(b >> 4) as usize] as char);
            out.push(HEX[(b & 0xf) as usize] as char);
        }
        out
    }

    pub fn decode(s: &str) -> Result<Vec<u8>, ()> {
        if s.len() % 2 != 0 {
            return Err(());
        }
        (0..s.len())
            .step_by(2)
            .map(|i| u8::from_str_radix(&s[i..i + 2], 16).map_err(|_| ()))
            .collect()
    }
}

pub use sstable::sstable_path;

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn meta(dir: &Path, number: u64, level: u32, lo: &str, hi: &str, size: u64) -> FileMeta {
        FileMeta {
            number,
            level,
            file_size: size,
            smallest: lo.as_bytes().to_vec(),
            largest: hi.as_bytes().to_vec(),
            path: sstable_path(dir, number),
        }
    }

    #[test]
    fn manifest_roundtrip() {
        let dir = tempdir().unwrap();
        let opts = Options::new(dir.path());
        {
            let mut vs = VersionSet::open(&opts).unwrap();
            vs.last_sequence = 77;
            vs.next_file_number = 10;
            vs.add_file(meta(dir.path(), 3, 0, "a", "m", 100)).unwrap();
            vs.add_file(meta(dir.path(), 5, 1, "n", "z", 200)).unwrap();
            vs.add_file(meta(dir.path(), 4, 1, "a", "c", 50)).unwrap();
        }
        let vs = VersionSet::open(&opts).unwrap();
        assert_eq!(vs.last_sequence, 77);
        assert_eq!(vs.next_file_number, 10);
        let v = vs.current().read().clone();
        assert_eq!(v.files[0].len(), 1);
        // Level >= 1 stays sorted by smallest key.
        let l1: Vec<u64> = v.files[1].iter().map(|f| f.number).collect();
        assert_eq!(l1, vec![4, 5]);
        assert_eq!(v.level_bytes(1), 250);
    }

    #[test]
    fn apply_compaction_moves_files() {
        let dir = tempdir().unwrap();
        let mut vs = VersionSet::open(&Options::new(dir.path())).unwrap();
        vs.add_file(meta(dir.path(), 1, 0, "a", "b", 1)).unwrap();
        vs.add_file(meta(dir.path(), 2, 0, "c", "d", 1)).unwrap();
        vs.apply_compaction(0, &[1, 2], vec![meta(dir.path(), 3, 1, "a", "d", 2)])
            .unwrap();
        let v = vs.current().read().clone();
        assert!(v.files[0].is_empty());
        assert_eq!(
            v.files[1].iter().map(|f| f.number).collect::<Vec<_>>(),
            vec![3]
        );
    }

    #[test]
    fn rejects_level_out_of_range() {
        let dir = tempdir().unwrap();
        let mut vs = VersionSet::open(&Options::new(dir.path())).unwrap();
        assert!(vs
            .add_file(meta(dir.path(), 1, NUM_LEVELS as u32, "a", "b", 1))
            .is_err());
    }

    #[test]
    fn l0_newest_first_then_levels() {
        let dir = tempdir().unwrap();
        let mut v = Version::new();
        v.files[0] = vec![
            meta(dir.path(), 2, 0, "a", "z", 1),
            meta(dir.path(), 9, 0, "a", "z", 1),
        ];
        v.files[2] = vec![meta(dir.path(), 1, 2, "a", "z", 1)];
        let order: Vec<u64> = v
            .all_tables_newest_first()
            .iter()
            .map(|m| m.number)
            .collect();
        assert_eq!(order, vec![9, 2, 1]);
    }

    #[test]
    fn pick_compaction_l0_trigger_includes_only_overlapping_l1() {
        let dir = tempdir().unwrap();
        let opts = Options::new(dir.path());
        let mut vs = VersionSet::open(&opts).unwrap();
        for n in 1..=3 {
            vs.add_file(meta(dir.path(), n, 0, "c", "f", 1)).unwrap();
        }
        vs.add_file(meta(dir.path(), 10, 1, "a", "b", 1)).unwrap(); // disjoint
        vs.add_file(meta(dir.path(), 11, 1, "e", "h", 1)).unwrap(); // overlaps
        assert!(
            vs.pick_compaction(&opts).is_none(),
            "3 L0 files is below trigger"
        );

        vs.add_file(meta(dir.path(), 4, 0, "d", "g", 1)).unwrap();
        let job = vs.pick_compaction(&opts).unwrap();
        assert_eq!(job.level, 0);
        assert_eq!(job.output_level, 1);
        let mut removed = job.remove.clone();
        removed.sort_unstable();
        assert_eq!(removed, vec![1, 2, 3, 4, 11]);
    }

    #[test]
    fn pick_compaction_by_level_size() {
        let dir = tempdir().unwrap();
        let mut opts = Options::new(dir.path());
        opts.level_base_bytes = 100;
        let mut vs = VersionSet::open(&opts).unwrap();
        vs.add_file(meta(dir.path(), 1, 1, "a", "f", 60)).unwrap();
        vs.add_file(meta(dir.path(), 2, 2, "e", "k", 60)).unwrap();
        assert!(vs.pick_compaction(&opts).is_none());

        vs.add_file(meta(dir.path(), 3, 1, "g", "z", 60)).unwrap();
        let job = vs.pick_compaction(&opts).unwrap();
        assert_eq!((job.level, job.output_level), (1, 2));
        // Victim is the first L1 file by key, plus its L2 overlap.
        assert_eq!(job.remove, vec![1, 2]);
    }

    #[test]
    fn corrupt_current_is_an_error() {
        let dir = tempdir().unwrap();
        fs::write(dir.path().join("CURRENT"), "garbage\n").unwrap();
        assert!(VersionSet::open(&Options::new(dir.path())).is_err());
    }

    #[test]
    fn hex_roundtrip() {
        let bytes = vec![0u8, 1, 0x7f, 0x80, 0xff];
        assert_eq!(hex::decode(&hex::encode(&bytes)).unwrap(), bytes);
        assert!(hex::decode("abc").is_err());
        assert!(hex::decode("zz").is_err());
    }
}
