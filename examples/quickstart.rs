//! Put, get, delete, flush, scan, and reopen.
//!
//! ```bash
//! cargo run --example quickstart
//! ```

use spindle::{Db, Options, SyncPolicy};

fn main() -> spindle::Result<()> {
    let dir = tempfile::tempdir().expect("create temp dir");
    let path = dir.path().to_path_buf();

    let mut opts = Options::new(&path);
    opts.sync = SyncPolicy::EveryWrite;
    let db = Db::open(opts)?;

    println!("spindle quickstart");
    println!("  path {}", db.path().display());

    db.put(b"user:ada", b"lovelace")?;
    db.put(b"user:grace", b"hopper")?;
    db.put(b"user:alan", b"turing")?;
    println!("  put    user:ada = lovelace");
    println!("  put    user:grace = hopper");
    println!("  put    user:alan = turing");

    let grace = db.get(b"user:grace")?;
    println!("  get    user:grace -> {}", display(grace.as_deref()));
    assert_eq!(grace.as_deref(), Some(b"hopper".as_slice()));

    db.delete(b"user:grace")?;
    let grace = db.get(b"user:grace")?;
    println!("  delete user:grace");
    println!("  get    user:grace -> {}", display(grace.as_deref()));
    assert_eq!(grace, None);

    db.flush()?;
    println!("  flush  memtable -> L0 SSTable");

    let alan = db.get(b"user:alan")?;
    println!(
        "  get    user:alan -> {} (after flush)",
        display(alan.as_deref())
    );
    assert_eq!(alan.as_deref(), Some(b"turing".as_slice()));

    println!("  scan   [user:, user;)");
    let mut keys = Vec::new();
    for kv in db.scan(Some(b"user:"), Some(b"user;"))? {
        println!(
            "         {} = {}",
            String::from_utf8_lossy(&kv.key),
            String::from_utf8_lossy(&kv.value)
        );
        keys.push(kv.key);
    }
    assert_eq!(keys, vec![b"user:ada".to_vec(), b"user:alan".to_vec()]);

    drop(db);

    let db = Db::open(Options::new(&path))?;
    let ada = db.get(b"user:ada")?;
    let grace = db.get(b"user:grace")?;
    println!("  reopen get user:ada -> {}", display(ada.as_deref()));
    println!("  reopen get user:grace -> {}", display(grace.as_deref()));
    assert_eq!(ada.as_deref(), Some(b"lovelace".as_slice()));
    assert_eq!(grace, None);
    println!("ok");
    Ok(())
}

fn display(value: Option<&[u8]>) -> String {
    match value {
        Some(bytes) => String::from_utf8_lossy(bytes).into_owned(),
        None => "<missing>".to_string(),
    }
}
