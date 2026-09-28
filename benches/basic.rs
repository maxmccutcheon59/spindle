//! Day-one microbenchmarks for Spindle.
//!
//! Run: `cargo bench --bench basic`

use std::time::Duration;

use criterion::{black_box, criterion_group, criterion_main, Criterion, Throughput};
use spindle::{Db, Options, SyncPolicy};
use tempfile::tempdir;

fn opts(path: &std::path::Path, sync: SyncPolicy) -> Options {
    let mut o = Options::new(path);
    o.sync = sync;
    o.write_buffer_size = 2 * 1024 * 1024;
    o.disable_compaction = true;
    o
}

fn bench_puts(c: &mut Criterion) {
    let mut g = c.benchmark_group("put");
    g.throughput(Throughput::Elements(1));
    g.measurement_time(Duration::from_secs(5));

    g.bench_function("mem_only_no_sync", |b| {
        let dir = tempdir().unwrap();
        // GroupCommit with a long window ≈ rarely sync during the bench.
        let db = Db::open(opts(
            dir.path(),
            SyncPolicy::GroupCommit {
                group_commit_ms: 60_000,
            },
        ))
        .unwrap();
        let mut i = 0u64;
        b.iter(|| {
            let key = format!("k{i:08}");
            db.put(key.as_bytes(), b"value-pad-pad-pad").unwrap();
            i += 1;
            black_box(i);
        });
    });

    // Cost of one put when the memtable already holds many entries. A write
    // path that touches every buffered entry (e.g. copying the memtable to
    // publish it to readers) shows up here as time growing with `prefill`.
    for prefill in [1_000u64, 20_000, 100_000] {
        g.bench_function(format!("mem_only_prefilled_{prefill}"), |b| {
            let dir = tempdir().unwrap();
            let mut o = opts(
                dir.path(),
                SyncPolicy::GroupCommit {
                    group_commit_ms: 60_000,
                },
            );
            o.write_buffer_size = 256 * 1024 * 1024; // never flush during the run
            let db = Db::open(o).unwrap();
            for i in 0..prefill {
                db.put(format!("p{i:08}").as_bytes(), b"value-pad-pad-pad")
                    .unwrap();
            }
            let mut i = 0u64;
            b.iter(|| {
                let key = format!("k{i:08}");
                db.put(key.as_bytes(), b"value-pad-pad-pad").unwrap();
                i += 1;
                black_box(i);
            });
        });
    }

    g.bench_function("durable_every_write", |b| {
        let dir = tempdir().unwrap();
        let db = Db::open(opts(dir.path(), SyncPolicy::EveryWrite)).unwrap();
        let mut i = 0u64;
        b.iter(|| {
            let key = format!("k{i:08}");
            db.put(key.as_bytes(), b"value-pad-pad-pad").unwrap();
            i += 1;
            black_box(i);
        });
    });
    g.finish();
}

fn bench_gets(c: &mut Criterion) {
    let dir = tempdir().unwrap();
    let db = Db::open(opts(
        dir.path(),
        SyncPolicy::GroupCommit {
            group_commit_ms: 60_000,
        },
    ))
    .unwrap();
    for i in 0..10_000u64 {
        let key = format!("k{i:08}");
        db.put(key.as_bytes(), b"value-pad-pad-pad").unwrap();
    }
    db.flush().unwrap();

    let mut g = c.benchmark_group("get");
    g.throughput(Throughput::Elements(1));
    g.bench_function("random_after_flush", |b| {
        let mut i = 0u64;
        b.iter(|| {
            let key = format!("k{:08}", i % 10_000);
            black_box(db.get(key.as_bytes()).unwrap());
            i += 1;
        });
    });
    g.finish();
}

criterion_group!(benches, bench_puts, bench_gets);
criterion_main!(benches);
