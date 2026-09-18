//! Adversarial SSTable parser fuzz (milestone 8).

use proptest::prelude::*;
use proptest::strategy::ValueTree;
use proptest::test_runner::TestRunner;
use spindle::Table;
use tempfile::tempdir;

#[test]
fn garbage_sstable_bytes_do_not_panic() {
    let mut runner = TestRunner::deterministic();
    let strategy = prop::collection::vec(any::<u8>(), 0..8192);
    for _ in 0..64 {
        let data = strategy.new_tree(&mut runner).unwrap().current();
        let dir = tempdir().unwrap();
        let path = dir.path().join("fuzz.sst");
        std::fs::write(&path, &data).unwrap();
        let _ = Table::open(&path);
    }
}

#[test]
fn truncated_valid_sstable_is_safe() {
    let dir = tempdir().unwrap();
    let mut opts = spindle::Options::new(dir.path());
    opts.disable_compaction = true;
    opts.write_buffer_size = 64;
    opts.sync = spindle::SyncPolicy::GroupCommit {
        group_commit_ms: 60_000,
    };
    {
        let db = spindle::Db::open(opts.clone()).unwrap();
        db.put(b"a", b"1").unwrap();
        db.put(b"b", b"2").unwrap();
        db.flush().unwrap();
    }
    let sst = std::fs::read_dir(dir.path())
        .unwrap()
        .filter_map(|e| e.ok())
        .find(|e| e.path().extension().is_some_and(|x| x == "sst"))
        .map(|e| e.path())
        .expect("expected an SSTable after flush");

    let original = std::fs::read(&sst).unwrap();
    for cut in [
        0,
        1,
        8,
        16,
        32,
        original.len() / 2,
        original.len().saturating_sub(1),
    ] {
        let mut bytes = original[..cut.min(original.len())].to_vec();
        bytes.extend_from_slice(&[0xde, 0xad, 0xbe, 0xef]);
        std::fs::write(&sst, &bytes).unwrap();
        let _ = Table::open(&sst);
    }
}
