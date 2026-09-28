//! Randomized model test.
//!
//! Runs random puts, deletes, flushes, snapshots, and reopens against both
//! Spindle and a plain `BTreeMap`, with a tiny write buffer and background
//! compaction on, and checks every read (including reads through old
//! snapshots) against the model.

use std::collections::BTreeMap;

use rand::rngs::StdRng;
use rand::{Rng, SeedableRng};
use spindle::{Db, Options, Snapshot, SyncPolicy};
use tempfile::tempdir;

type Model = BTreeMap<Vec<u8>, Vec<u8>>;

fn options(path: &std::path::Path) -> Options {
    let mut o = Options::new(path);
    o.write_buffer_size = 600; // flush every ~10 writes
    o.block_size = 128;
    o.level_base_bytes = 2_000; // push data down through several levels
    o.sync = SyncPolicy::GroupCommit {
        group_commit_ms: 60_000,
    };
    o
}

fn key(rng: &mut StdRng) -> Vec<u8> {
    format!("k{:02}", rng.gen_range(0..24)).into_bytes()
}

fn scan_all(db: &Db, snap: Option<&Snapshot>) -> Model {
    let iter = match snap {
        Some(s) => db.scan_snapshot(None, None, s),
        None => db.scan(None, None),
    }
    .unwrap();
    iter.map(|p| (p.key, p.value)).collect()
}

fn run(seed: u64, ops: usize) {
    let mut rng = StdRng::seed_from_u64(seed);
    let dir = tempdir().unwrap();
    let mut db = Db::open(options(dir.path())).unwrap();
    let mut model = Model::new();
    let mut snapshots: Vec<(Snapshot, Model)> = Vec::new();

    for step in 0..ops {
        let ctx = format!("seed {seed} step {step}");
        match rng.gen_range(0..100) {
            0..=44 => {
                let k = key(&mut rng);
                let v = format!("v{step}").into_bytes();
                db.put(&k, &v).unwrap();
                model.insert(k, v);
            }
            45..=59 => {
                let k = key(&mut rng);
                db.delete(&k).unwrap();
                model.remove(&k);
            }
            60..=74 => {
                let k = key(&mut rng);
                assert_eq!(db.get(&k).unwrap(), model.get(&k).cloned(), "{ctx}: get");
            }
            75..=79 => db.flush().unwrap(),
            80..=86 if snapshots.len() < 6 => snapshots.push((db.snapshot(), model.clone())),
            87..=91 if !snapshots.is_empty() => {
                let i = rng.gen_range(0..snapshots.len());
                snapshots.swap_remove(i);
            }
            92..=96 if !snapshots.is_empty() => {
                let (snap, at) = &snapshots[rng.gen_range(0..snapshots.len())];
                let k = key(&mut rng);
                assert_eq!(
                    db.get_snapshot(&k, snap).unwrap(),
                    at.get(&k).cloned(),
                    "{ctx}: snapshot get"
                );
            }
            97 => {
                assert_eq!(scan_all(&db, None), model, "{ctx}: scan");
                for (snap, at) in &snapshots {
                    assert_eq!(&scan_all(&db, Some(snap)), at, "{ctx}: snapshot scan");
                }
            }
            98 => {
                // Reopen: old snapshots belong to the old handle.
                snapshots.clear();
                drop(db);
                db = Db::open(options(dir.path())).unwrap();
                assert_eq!(scan_all(&db, None), model, "{ctx}: after reopen");
            }
            _ => {}
        }
    }

    assert_eq!(scan_all(&db, None), model, "seed {seed}: final scan");
    for (snap, at) in &snapshots {
        assert_eq!(
            &scan_all(&db, Some(snap)),
            at,
            "seed {seed}: final snapshot"
        );
    }
}

#[test]
fn matches_model_across_flush_compaction_snapshots_and_reopen() {
    for seed in 0..40 {
        run(seed, 600);
    }
}
