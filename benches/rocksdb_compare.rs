//! Optional RocksDB comparison.
//!
//! ```sh
//! cargo bench --bench rocksdb_compare --features rocksdb-bench
//! ```
//!
//! Requires system RocksDB / lz4. Numbers belong in `DESIGN.md` §9 with
//! honest analysis of where Spindle loses.

#![cfg(feature = "rocksdb-bench")]

use std::time::Duration;

use criterion::{black_box, criterion_group, criterion_main, Criterion, Throughput};
use rocksdb::{Options as RocksOptions, DB as RocksDb};
use spindle::{Db, Options, SyncPolicy};
use tempfile::tempdir;

fn spindle_opts(path: &std::path::Path) -> Options {
    let mut o = Options::new(path);
    o.sync = SyncPolicy::EveryWrite;
    o.write_buffer_size = 4 * 1024 * 1024;
    o.disable_compaction = false;
    o
}

fn bench_compare(c: &mut Criterion) {
    let mut g = c.benchmark_group("compare_put_sync");
    g.throughput(Throughput::Elements(1));
    g.measurement_time(Duration::from_secs(8));

    g.bench_function("spindle", |b| {
        let dir = tempdir().unwrap();
        let db = Db::open(spindle_opts(dir.path())).unwrap();
        let mut i = 0u64;
        b.iter(|| {
            let key = format!("k{i:08}");
            db.put(key.as_bytes(), b"xxxxxxxxxxxxxxxx").unwrap();
            i += 1;
            black_box(i);
        });
    });

    g.bench_function("rocksdb", |b| {
        let dir = tempdir().unwrap();
        let mut opts = RocksOptions::default();
        opts.create_if_missing(true);
        let db = RocksDb::open(&opts, dir.path()).unwrap();
        let mut i = 0u64;
        b.iter(|| {
            let key = format!("k{i:08}");
            db.put(key.as_bytes(), b"xxxxxxxxxxxxxxxx").unwrap();
            // RocksDB Sync write options.
            let mut wo = rocksdb::WriteOptions::default();
            wo.set_sync(true);
            db.put_opt(key.as_bytes(), b"xxxxxxxxxxxxxxxx", &wo)
                .unwrap();
            i += 1;
            black_box(i);
        });
    });
    g.finish();
}

criterion_group!(benches, bench_compare);
criterion_main!(benches);
