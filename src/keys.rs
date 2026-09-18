//! Internal key encoding: user key + sequence + value type.
//!
//! RocksDB/LevelDB encode the sequence and type into 8 bytes after the
//! user key so that newer versions sort first within a user key. We do
//! the same: descending sequence, then Put before Delete at equal seq
//! (which should never happen for a single writer).

use std::cmp::Ordering;

/// Monotonic write sequence number. Zero is reserved / unused.
pub type SequenceNumber = u64;

/// Discriminator stored with every internal key.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
#[repr(u8)]
pub enum ValueType {
    /// Soft delete; wins over older Puts for the same user key.
    Deletion = 0,
    /// Ordinary put.
    Value = 1,
}

impl ValueType {
    pub fn from_u8(v: u8) -> Option<Self> {
        match v {
            0 => Some(Self::Deletion),
            1 => Some(Self::Value),
            _ => None,
        }
    }
}

/// User key + sequence + type. Owned form used in memtables and indexes.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct InternalKey {
    pub user_key: Vec<u8>,
    pub sequence: SequenceNumber,
    pub value_type: ValueType,
}

impl InternalKey {
    pub fn new(user_key: Vec<u8>, sequence: SequenceNumber, value_type: ValueType) -> Self {
        Self {
            user_key,
            sequence,
            value_type,
        }
    }

    /// Encode as `user_key || seq_type_be` where the low byte of the
    /// packed u64 is the value type and the upper 56 bits are the
    /// sequence — LevelDB's packing, which keeps comparisons cheap.
    pub fn encode(&self) -> Vec<u8> {
        let mut buf = Vec::with_capacity(self.user_key.len() + 8);
        buf.extend_from_slice(&self.user_key);
        let packed = (self.sequence << 8) | self.value_type as u64;
        buf.extend_from_slice(&packed.to_le_bytes());
        buf
    }

    pub fn decode(bytes: &[u8]) -> Option<Self> {
        if bytes.len() < 8 {
            return None;
        }
        let (user_key, tag) = bytes.split_at(bytes.len() - 8);
        let packed = u64::from_le_bytes(tag.try_into().ok()?);
        let value_type = ValueType::from_u8((packed & 0xff) as u8)?;
        let sequence = packed >> 8;
        Some(Self {
            user_key: user_key.to_vec(),
            sequence,
            value_type,
        })
    }

    /// Compare for BTree / SSTable order: user key ascending, then
    /// sequence descending, then type descending (Value > Deletion).
    pub fn cmp_internal(a: &Self, b: &Self) -> Ordering {
        match a.user_key.cmp(&b.user_key) {
            Ordering::Equal => {}
            other => return other,
        }
        match b.sequence.cmp(&a.sequence) {
            Ordering::Equal => {}
            other => return other,
        }
        b.value_type.cmp(&a.value_type)
    }
}

impl Ord for InternalKey {
    fn cmp(&self, other: &Self) -> Ordering {
        Self::cmp_internal(self, other)
    }
}

impl PartialOrd for InternalKey {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

/// Lookup key used for seeks: user key + snapshot sequence.
/// Encodes as if it were a Put at `sequence` so the first matching
/// entry in sorted order is the newest visible version.
#[derive(Debug, Clone)]
pub struct LookupKey {
    encoded: Vec<u8>,
}

impl LookupKey {
    pub fn new(user_key: &[u8], sequence: SequenceNumber) -> Self {
        let ik = InternalKey::new(user_key.to_vec(), sequence, ValueType::Value);
        Self {
            encoded: ik.encode(),
        }
    }

    pub fn encoded(&self) -> &[u8] {
        &self.encoded
    }

    pub fn user_key(&self) -> &[u8] {
        &self.encoded[..self.encoded.len() - 8]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encode_roundtrip() {
        let k = InternalKey::new(b"hello".to_vec(), 42, ValueType::Value);
        let enc = k.encode();
        let dec = InternalKey::decode(&enc).unwrap();
        assert_eq!(k, dec);
    }

    #[test]
    fn sort_order_newer_first() {
        let older = InternalKey::new(b"a".to_vec(), 1, ValueType::Value);
        let newer = InternalKey::new(b"a".to_vec(), 2, ValueType::Value);
        assert!(newer < older);
    }

    #[test]
    fn different_user_keys() {
        let a = InternalKey::new(b"a".to_vec(), 1, ValueType::Value);
        let b = InternalKey::new(b"b".to_vec(), 100, ValueType::Value);
        assert!(a < b);
    }
}
