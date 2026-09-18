//! Crash-recovery harness (milestone 8).
//!
//! Spawns `crash_child`, `kill -9`s it after some ACKs, reopens the DB, and
//! asserts every acknowledged write survived.

use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::thread;
use std::time::Duration;

use spindle::{Db, Options, SyncPolicy};

fn last_acked(ack_path: &Path) -> Option<usize> {
    let mut s = String::new();
    fs::File::open(ack_path)
        .and_then(|mut f| f.read_to_string(&mut s))
        .ok()?;
    s.lines().filter_map(|l| l.parse().ok()).max()
}

#[test]
fn kill9_never_loses_acked_writes() {
    let root = tempfile::tempdir().unwrap();
    let db_dir = root.path().join("db");
    let ack_path = root.path().join("ack.txt");
    fs::create_dir_all(&db_dir).unwrap();

    // Locate the crash_child binary next to the test exe, or via CARGO_BIN_EXE_.
    let child_exe = option_env!("CARGO_BIN_EXE_crash_child")
        .map(PathBuf::from)
        .unwrap_or_else(|| {
            let mut p = std::env::current_exe().unwrap();
            p.pop();
            if p.ends_with("deps") {
                p.pop();
            }
            p.join("crash_child")
        });

    assert!(
        child_exe.exists(),
        "crash_child binary missing at {}",
        child_exe.display()
    );

    let mut child = Command::new(&child_exe)
        .env("SPINDLE_CRASH_DIR", &db_dir)
        .env("SPINDLE_ACK_PATH", &ack_path)
        .env("SPINDLE_CRASH_N", "60")
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .spawn()
        .expect("spawn crash_child");

    for _ in 0..500 {
        if last_acked(&ack_path).unwrap_or(0) >= 8 {
            break;
        }
        thread::sleep(Duration::from_millis(20));
    }

    let last_before_kill = last_acked(&ack_path);
    assert!(
        last_before_kill.is_some(),
        "child never acknowledged a write; stderr={:?}",
        child.stderr.as_mut().map(|s| {
            let mut buf = String::new();
            let _ = s.read_to_string(&mut buf);
            buf
        })
    );

    #[cfg(unix)]
    {
        let status = Command::new("kill")
            .args(["-9", &child.id().to_string()])
            .status()
            .expect("kill");
        assert!(status.success());
    }
    let _ = child.wait();

    let last = last_before_kill.unwrap();
    let mut opts = Options::new(&db_dir);
    opts.sync = SyncPolicy::EveryWrite;
    opts.disable_compaction = true;
    let db = Db::open(opts).expect("reopen after crash");

    for i in 0..=last {
        let key = format!("k{i:05}");
        let want = format!("v{i:05}");
        let got = db.get(key.as_bytes()).unwrap();
        assert_eq!(
            got.as_deref(),
            Some(want.as_bytes()),
            "acked write {i} missing after kill -9 (last_acked={last})"
        );
    }
}
