//! Child process for crash-recovery testing.
//!
//! Writes ACK lines after each durable put, then exits cleanly if not killed.

use std::env;
use std::fs;
use std::io::Write;
use std::path::PathBuf;
use std::thread;
use std::time::Duration;

use spindle::{Db, Options, SyncPolicy};

fn main() {
    let dir = PathBuf::from(env::var("SPINDLE_CRASH_DIR").expect("SPINDLE_CRASH_DIR"));
    let ack_path = PathBuf::from(env::var("SPINDLE_ACK_PATH").expect("SPINDLE_ACK_PATH"));
    let n: usize = env::var("SPINDLE_CRASH_N")
        .unwrap_or_else(|_| "200".into())
        .parse()
        .expect("SPINDLE_CRASH_N");

    let mut opts = Options::new(&dir);
    opts.sync = SyncPolicy::EveryWrite;
    opts.disable_compaction = true;
    opts.write_buffer_size = 1 << 20;

    let db = Db::open(opts).expect("open");
    let mut ack = fs::File::create(&ack_path).expect("ack file");
    for i in 0..n {
        let key = format!("k{i:05}");
        let val = format!("v{i:05}");
        db.put(key.as_bytes(), val.as_bytes()).expect("put");
        writeln!(ack, "{i}").expect("ack");
        ack.flush().expect("flush");
        thread::sleep(Duration::from_millis(2));
    }
}
