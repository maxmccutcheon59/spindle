//! SSTable: sorted string table on disk.
//!
//! ## Layout (LevelDB-inspired)
//!
//! ```text
//! [data block 0]
//! [data block 1]
//! ...
//! [meta block: bloom filter]
//! [index block]          // restart: smallest key of each data block → handle
//! [footer]
//! ```
//!
//! Footer (48 bytes fixed):
//! ```text
//! [bloom_handle: BlockHandle][index_handle: BlockHandle][padding to 40][magic: u64 LE]
//! BlockHandle = [offset: u64 LE][size: u64 LE]  (16 bytes)
//! magic = 0x53504e444c535354  ("SPNDLSST")
//! ```

mod bloom;

pub use bloom::BloomFilter;

use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};

use crate::error::{Error, Result};
use crate::keys::{InternalKey, LookupKey, ValueType};

const MAGIC: u64 = 0x5350_4e44_4c53_5354; // SPNDLSST
const FOOTER_SIZE: usize = 48;
const RESTART_INTERVAL: usize = 16;

/// Pointer into an SSTable file.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct BlockHandle {
    pub offset: u64,
    pub size: u64,
}

impl BlockHandle {
    fn encode(self) -> [u8; 16] {
        let mut buf = [0u8; 16];
        buf[..8].copy_from_slice(&self.offset.to_le_bytes());
        buf[8..].copy_from_slice(&self.size.to_le_bytes());
        buf
    }

    fn decode(bytes: &[u8]) -> Result<Self> {
        if bytes.len() < 16 {
            return Err(Error::Corruption("block handle truncated".into()));
        }
        Ok(Self {
            offset: u64::from_le_bytes(bytes[..8].try_into().unwrap()),
            size: u64::from_le_bytes(bytes[8..16].try_into().unwrap()),
        })
    }
}

/// Builds an SSTable from sorted internal-key / value pairs.
pub struct TableBuilder {
    file: File,
    path: PathBuf,
    block_size: usize,
    bloom_bits: usize,
    data_buf: Vec<u8>,
    restarts: Vec<u32>,
    entries_in_block: usize,
    index: Vec<(Vec<u8>, BlockHandle)>,
    bloom_keys: Vec<Vec<u8>>,
    offset: u64,
    last_key: Vec<u8>,
    entries: u64,
}

impl TableBuilder {
    pub fn new(path: PathBuf, block_size: usize, bloom_bits: usize) -> Result<Self> {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        let file = File::create(&path)?;
        Ok(Self {
            file,
            path,
            block_size,
            bloom_bits,
            data_buf: Vec::new(),
            restarts: vec![0],
            entries_in_block: 0,
            index: Vec::new(),
            bloom_keys: Vec::new(),
            offset: 0,
            last_key: Vec::new(),
            entries: 0,
        })
    }

    /// Add a key/value. Keys must be in internal-key sorted order.
    pub fn add(&mut self, key: &[u8], value: &[u8]) -> Result<()> {
        if !self.last_key.is_empty() && key < self.last_key.as_slice() {
            return Err(Error::InvalidArgument(
                "SSTable keys must be added in sorted order".into(),
            ));
        }
        if self.entries_in_block > 0 && self.entries_in_block % RESTART_INTERVAL == 0 {
            self.restarts.push(self.data_buf.len() as u32);
        }
        // Shared prefix compression against last key in block.
        let shared = if self.entries_in_block == 0 {
            0
        } else {
            shared_prefix(&self.last_key, key)
        };
        let non_shared = key.len() - shared;
        put_varint(&mut self.data_buf, shared as u32);
        put_varint(&mut self.data_buf, non_shared as u32);
        put_varint(&mut self.data_buf, value.len() as u32);
        self.data_buf.extend_from_slice(&key[shared..]);
        self.data_buf.extend_from_slice(value);

        self.last_key = key.to_vec();
        self.entries_in_block += 1;
        self.entries += 1;

        if let Some(ik) = InternalKey::decode(key) {
            self.bloom_keys.push(ik.user_key);
        }

        if self.data_buf.len() >= self.block_size {
            self.flush_data_block()?;
        }
        Ok(())
    }

    fn flush_data_block(&mut self) -> Result<()> {
        if self.data_buf.is_empty() {
            return Ok(());
        }
        let handle = self.write_block(&self.data_buf.clone(), &self.restarts.clone())?;
        self.index.push((self.last_key.clone(), handle));
        self.data_buf.clear();
        self.restarts = vec![0];
        self.entries_in_block = 0;
        Ok(())
    }

    fn write_block(&mut self, data: &[u8], restarts: &[u32]) -> Result<BlockHandle> {
        let mut block = data.to_vec();
        for r in restarts {
            block.extend_from_slice(&r.to_le_bytes());
        }
        block.extend_from_slice(&(restarts.len() as u32).to_le_bytes());
        let crc = crc32fast::hash(&block);
        let offset = self.offset;
        self.file.write_all(&block)?;
        self.file.write_all(&crc.to_le_bytes())?;
        let size = block.len() as u64 + 4;
        self.offset += size;
        Ok(BlockHandle { offset, size })
    }

    pub fn finish(mut self) -> Result<TableMeta> {
        self.flush_data_block()?;

        // Bloom meta block.
        let bloom = if self.bloom_bits > 0 && !self.bloom_keys.is_empty() {
            BloomFilter::build(self.bloom_bits, &self.bloom_keys)
        } else {
            BloomFilter::empty()
        };
        let bloom_bytes = bloom.encode();
        let bloom_handle = self.write_block(&bloom_bytes, &[0])?;

        // Index block: list of (separator key, handle).
        let mut index_data = Vec::new();
        let mut index_restarts = vec![0u32];
        for (i, (key, handle)) in self.index.iter().enumerate() {
            if i > 0 && i % RESTART_INTERVAL == 0 {
                index_restarts.push(index_data.len() as u32);
            }
            put_varint(&mut index_data, 0);
            put_varint(&mut index_data, key.len() as u32);
            put_varint(&mut index_data, 16);
            index_data.extend_from_slice(key);
            index_data.extend_from_slice(&handle.encode());
        }
        let index_handle = self.write_block(&index_data, &index_restarts)?;

        // Footer.
        let mut footer = Vec::with_capacity(FOOTER_SIZE);
        footer.extend_from_slice(&bloom_handle.encode());
        footer.extend_from_slice(&index_handle.encode());
        while footer.len() < FOOTER_SIZE - 8 {
            footer.push(0);
        }
        footer.extend_from_slice(&MAGIC.to_le_bytes());
        assert_eq!(footer.len(), FOOTER_SIZE);
        self.file.write_all(&footer)?;
        self.file.sync_data()?;

        let smallest = self
            .index
            .first()
            .and_then(|(k, _)| InternalKey::decode(k))
            .map(|k| k.user_key);
        let largest = InternalKey::decode(&self.last_key).map(|k| k.user_key);

        let _ = (bloom_handle, index_handle, self.entries);
        Ok(TableMeta {
            path: self.path,
            file_size: self.offset + FOOTER_SIZE as u64,
            smallest_user_key: smallest.unwrap_or_default(),
            largest_user_key: largest.unwrap_or_default(),
        })
    }
}

/// Result of an SSTable point lookup.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TableGet {
    /// Visible value.
    Found(Vec<u8>),
    /// Tombstone at or below the snapshot sequence.
    Deleted,
    /// Key not present in this table.
    NotFound,
}

/// Lightweight metadata returned after a successful build / open.
#[derive(Debug, Clone)]
pub struct TableMeta {
    pub path: PathBuf,
    pub file_size: u64,
    pub smallest_user_key: Vec<u8>,
    pub largest_user_key: Vec<u8>,
}

/// Opened SSTable for point lookups and iteration.
pub struct Table {
    data: Vec<u8>,
    bloom: BloomFilter,
    index_block: Block,
}

impl Table {
    /// Memory-map-free open: load the whole file and parse footer/index.
    pub fn open(path: impl AsRef<Path>) -> Result<Self> {
        let path = path.as_ref().to_path_buf();
        let mut file = File::open(&path)?;
        let mut data = Vec::new();
        file.read_to_end(&mut data)?;
        if data.len() < FOOTER_SIZE {
            return Err(Error::Corruption("SSTable too small".into()));
        }
        let footer = &data[data.len() - FOOTER_SIZE..];
        let magic = u64::from_le_bytes(footer[FOOTER_SIZE - 8..].try_into().unwrap());
        if magic != MAGIC {
            return Err(Error::Corruption(format!("bad SSTable magic: {magic:#x}")));
        }
        let bloom_handle = BlockHandle::decode(&footer[0..16])?;
        let index_handle = BlockHandle::decode(&footer[16..32])?;

        let bloom_block = read_block(&data, bloom_handle)?;
        let bloom = BloomFilter::decode(bloom_block.data())?;
        let index_block = read_block(&data, index_handle)?;
        let _ = path;

        Ok(Self {
            data,
            bloom,
            index_block,
        })
    }

    /// Point lookup. Distinguishes miss / tombstone / value so the read
    /// path can stop probing older files on deletion.
    pub fn get(&self, lookup: &LookupKey) -> Result<TableGet> {
        let user_key = lookup.user_key();
        if !self.bloom.may_contain(user_key) {
            return Ok(TableGet::NotFound);
        }
        // Find the data block whose separator >= lookup key.
        let target = lookup.encoded();
        let mut chosen: Option<BlockHandle> = None;
        for (sep, value) in self.index_block.iter() {
            let handle = BlockHandle::decode(&value)?;
            chosen = Some(handle);
            if sep.as_slice() >= target {
                break;
            }
        }
        let Some(handle) = chosen else {
            return Ok(TableGet::NotFound);
        };
        let block = read_block(&self.data, handle)?;
        let seq = {
            let enc = lookup.encoded();
            u64::from_le_bytes(enc[enc.len() - 8..].try_into().unwrap()) >> 8
        };

        for (k, v) in block.iter() {
            let Some(ik) = InternalKey::decode(&k) else {
                continue;
            };
            if ik.user_key.as_slice() != user_key {
                if ik.user_key.as_slice() > user_key {
                    break;
                }
                continue;
            }
            if ik.sequence > seq {
                continue;
            }
            return Ok(match ik.value_type {
                ValueType::Deletion => TableGet::Deleted,
                ValueType::Value => TableGet::Found(v),
            });
        }
        Ok(TableGet::NotFound)
    }

    /// Iterate all internal keys in table order.
    pub fn iter(&self) -> Result<TableIterator<'_>> {
        Ok(TableIterator {
            table: self,
            index: self.index_block.iter().collect(),
            index_pos: 0,
            block: None,
            block_iter: None,
        })
    }
}

/// Iterator over all internal keys in an SSTable.
pub struct TableIterator<'a> {
    table: &'a Table,
    index: Vec<(Vec<u8>, Vec<u8>)>,
    index_pos: usize,
    block: Option<Block>,
    block_iter: Option<std::vec::IntoIter<(Vec<u8>, Vec<u8>)>>,
}

impl Iterator for TableIterator<'_> {
    type Item = Result<(InternalKey, Vec<u8>)>;

    fn next(&mut self) -> Option<Self::Item> {
        loop {
            if let Some(iter) = self.block_iter.as_mut() {
                if let Some((k, v)) = iter.next() {
                    return Some(match InternalKey::decode(&k) {
                        Some(ik) => Ok((ik, v)),
                        None => Err(Error::Corruption("bad internal key in SSTable".into())),
                    });
                }
            }
            if self.index_pos >= self.index.len() {
                return None;
            }
            let (_, handle_bytes) = &self.index[self.index_pos];
            self.index_pos += 1;
            let handle = match BlockHandle::decode(handle_bytes) {
                Ok(h) => h,
                Err(e) => return Some(Err(e)),
            };
            let block = match read_block(&self.table.data, handle) {
                Ok(b) => b,
                Err(e) => return Some(Err(e)),
            };
            let entries: Vec<_> = block.iter().collect();
            self.block = Some(block);
            self.block_iter = Some(entries.into_iter());
        }
    }
}

struct Block {
    raw: Vec<u8>,
    restart_offset: usize,
}

impl Block {
    fn data(&self) -> &[u8] {
        &self.raw[..self.restart_offset]
    }

    fn iter(&self) -> BlockIter<'_> {
        BlockIter {
            data: self.data(),
            offset: 0,
            last_key: Vec::new(),
        }
    }
}

struct BlockIter<'a> {
    data: &'a [u8],
    offset: usize,
    last_key: Vec<u8>,
}

impl Iterator for BlockIter<'_> {
    type Item = (Vec<u8>, Vec<u8>);

    fn next(&mut self) -> Option<Self::Item> {
        if self.offset >= self.data.len() {
            return None;
        }
        let (shared, o1) = get_varint(self.data, self.offset)?;
        let (non_shared, o2) = get_varint(self.data, o1)?;
        let (vlen, o3) = get_varint(self.data, o2)?;
        let shared = shared as usize;
        let non_shared = non_shared as usize;
        let vlen = vlen as usize;
        if o3 + non_shared + vlen > self.data.len() {
            return None;
        }
        let mut key = Vec::with_capacity(shared + non_shared);
        key.extend_from_slice(&self.last_key[..shared.min(self.last_key.len())]);
        key.extend_from_slice(&self.data[o3..o3 + non_shared]);
        let value = self.data[o3 + non_shared..o3 + non_shared + vlen].to_vec();
        self.offset = o3 + non_shared + vlen;
        self.last_key = key.clone();
        Some((key, value))
    }
}

fn read_block(file: &[u8], handle: BlockHandle) -> Result<Block> {
    let start = handle.offset as usize;
    let end = start + handle.size as usize;
    if end > file.len() || handle.size < 4 {
        return Err(Error::Corruption("block handle out of range".into()));
    }
    let slice = &file[start..end];
    let (content, crc_bytes) = slice.split_at(slice.len() - 4);
    let crc = u32::from_le_bytes(crc_bytes.try_into().unwrap());
    if crc32fast::hash(content) != crc {
        return Err(Error::Corruption("block CRC mismatch".into()));
    }
    if content.len() < 4 {
        return Err(Error::Corruption("block too small".into()));
    }
    let num_restarts =
        u32::from_le_bytes(content[content.len() - 4..].try_into().unwrap()) as usize;
    let restart_offset = content
        .len()
        .checked_sub(4 + num_restarts * 4)
        .ok_or_else(|| Error::Corruption("bad restart offset".into()))?;
    Ok(Block {
        raw: content.to_vec(),
        restart_offset,
    })
}

fn shared_prefix(a: &[u8], b: &[u8]) -> usize {
    a.iter().zip(b.iter()).take_while(|(x, y)| x == y).count()
}

fn put_varint(buf: &mut Vec<u8>, mut v: u32) {
    while v >= 0x80 {
        buf.push((v as u8) | 0x80);
        v >>= 7;
    }
    buf.push(v as u8);
}

fn get_varint(buf: &[u8], mut offset: usize) -> Option<(u32, usize)> {
    let mut result = 0u32;
    let mut shift = 0u32;
    loop {
        if offset >= buf.len() || shift > 28 {
            return None;
        }
        let byte = buf[offset];
        offset += 1;
        result |= u32::from(byte & 0x7f) << shift;
        if byte & 0x80 == 0 {
            return Some((result, offset));
        }
        shift += 7;
    }
}

pub fn sstable_path(dir: &Path, number: u64) -> PathBuf {
    dir.join(format!("{number:06}.sst"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn build_and_get() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("1.sst");
        let mut b = TableBuilder::new(path.clone(), 64, 10).unwrap();
        for i in 0..100u64 {
            let ik = InternalKey::new(format!("k{i:03}").into_bytes(), i + 1, ValueType::Value);
            b.add(&ik.encode(), format!("v{i}").as_bytes()).unwrap();
        }
        b.finish().unwrap();

        let t = Table::open(&path).unwrap();
        let v = t.get(&LookupKey::new(b"k042", 1000)).unwrap();
        assert_eq!(v, TableGet::Found(b"v42".to_vec()));
        assert_eq!(
            t.get(&LookupKey::new(b"missing", 1000)).unwrap(),
            TableGet::NotFound
        );
    }

    #[test]
    fn fuzz_truncated_and_garbage() {
        // Adversarial: truncated file and garbage magic must not panic.
        let dir = tempdir().unwrap();
        let path = dir.path().join("bad.sst");
        fs::write(&path, [0u8; 10]).unwrap();
        assert!(Table::open(&path).is_err());
        fs::write(&path, vec![0xabu8; 64]).unwrap();
        assert!(Table::open(&path).is_err());
    }
}
