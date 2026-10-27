//! Regression: a torn WAL tail must not swallow writes acknowledged after
//! the next reopen.
//!
//! Before the fix, reopening appended new records *after* the torn bytes.
//! The following replay stopped at the garbage, so an fsynced, acknowledged
//! `put` disappeared on the second reopen.

use std::fs::OpenOptions;
use std::io::Write;

use spindle::{Db, Options};

#[test]
fn writes_after_torn_tail_survive_second_reopen() {
    let dir = tempfile::tempdir().unwrap();
    {
        let db = Db::open(Options::new(dir.path())).unwrap();
        db.put(b"a", b"1").unwrap();
    }

    // Simulate a crash mid-append: a partial record header at the WAL tail.
    let wal = std::fs::read_dir(dir.path())
        .unwrap()
        .map(|e| e.unwrap().path())
        .find(|p| p.extension().is_some_and(|e| e == "log"))
        .expect("WAL file");
    OpenOptions::new()
        .append(true)
        .open(&wal)
        .unwrap()
        .write_all(&[0xAB, 0xCD, 0xEF])
        .unwrap();

    {
        let db = Db::open(Options::new(dir.path())).unwrap();
        assert_eq!(db.get(b"a").unwrap().as_deref(), Some(b"1".as_slice()));
        db.put(b"b", b"2").unwrap(); // default SyncPolicy::EveryWrite: fsynced
    }

    let db = Db::open(Options::new(dir.path())).unwrap();
    assert_eq!(db.get(b"a").unwrap().as_deref(), Some(b"1".as_slice()));
    assert_eq!(
        db.get(b"b").unwrap().as_deref(),
        Some(b"2".as_slice()),
        "write acknowledged after a torn tail was lost"
    );
}
