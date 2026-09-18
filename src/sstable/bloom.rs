//! Bloom filter for SSTable key-may-exist checks.
//!
//! Double-hashing construction from Kirsch & Mitzenmacher, also used by
//! LevelDB: `h1 + i*h2` mod bits. False-positive rate ≈ (1/2)^bits_per_key
//! when `k = bits_per_key * ln(2)`.

/// Probabilistic set membership filter.
#[derive(Debug, Clone)]
pub struct BloomFilter {
    bits: Vec<u8>,
    k: u32,
}

impl BloomFilter {
    pub fn empty() -> Self {
        Self {
            bits: Vec::new(),
            k: 0,
        }
    }

    pub fn build(bits_per_key: usize, keys: &[Vec<u8>]) -> Self {
        if keys.is_empty() || bits_per_key == 0 {
            return Self::empty();
        }
        let bits = (keys.len() * bits_per_key).max(64);
        let bytes = bits.div_ceil(8);
        let k = ((bits_per_key as f64) * std::f64::consts::LN_2).round() as u32;
        let k = k.clamp(1, 30);
        let mut filter = Self {
            bits: vec![0u8; bytes],
            k,
        };
        for key in keys {
            filter.add(key);
        }
        filter
    }

    fn add(&mut self, key: &[u8]) {
        if self.bits.is_empty() {
            return;
        }
        let nbits = self.bits.len() * 8;
        let (h1, h2) = hash_pair(key);
        for i in 0..self.k {
            let bit = (h1.wrapping_add(u32::wrapping_mul(i, h2)) as usize) % nbits;
            self.bits[bit / 8] |= 1 << (bit % 8);
        }
    }

    pub fn may_contain(&self, key: &[u8]) -> bool {
        if self.bits.is_empty() {
            return true; // no filter → must probe
        }
        let nbits = self.bits.len() * 8;
        let (h1, h2) = hash_pair(key);
        for i in 0..self.k {
            let bit = (h1.wrapping_add(u32::wrapping_mul(i, h2)) as usize) % nbits;
            if self.bits[bit / 8] & (1 << (bit % 8)) == 0 {
                return false;
            }
        }
        true
    }

    pub fn encode(&self) -> Vec<u8> {
        let mut out = self.bits.clone();
        out.push(self.k as u8);
        out
    }

    pub fn decode(bytes: &[u8]) -> crate::Result<Self> {
        if bytes.is_empty() {
            return Ok(Self::empty());
        }
        let k = *bytes.last().unwrap() as u32;
        Ok(Self {
            bits: bytes[..bytes.len() - 1].to_vec(),
            k,
        })
    }
}

fn hash_pair(key: &[u8]) -> (u32, u32) {
    // Two independent 32-bit hashes from one 64-bit murmur-ish mix.
    let mut h = 0xcbf29ce484222325u64;
    for &b in key {
        h ^= u64::from(b);
        h = h.wrapping_mul(0x100000001b3);
    }
    let h1 = h as u32;
    let h2 = (h >> 32) as u32 | 1; // force odd
    (h1, h2)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn no_false_negatives() {
        let keys: Vec<Vec<u8>> = (0..1000).map(|i| format!("key-{i}").into_bytes()).collect();
        let b = BloomFilter::build(10, &keys);
        for k in &keys {
            assert!(b.may_contain(k));
        }
        // Sanity: some missing key is usually rejected (not guaranteed).
        let _ = b.may_contain(b"nope-not-present");
    }
}
