//! Spindle — an LSM-tree key-value storage engine.
//!
//! Public surface is intentionally small: open a [`Db`], then
//! [`Db::put`] / [`Db::get`] / [`Db::delete`] / [`Db::scan`], optionally
//! under a [`Snapshot`].

#![deny(missing_docs)]

mod compaction;
mod db;
mod error;
mod iterator;
mod keys;
mod memtable;
mod options;
mod sstable;
mod version;
mod wal;

pub use db::{open, Db, Snapshot};
pub use error::{Error, Result};
pub use iterator::KvIter;
pub use options::{Options, SyncPolicy};
pub use sstable::Table;
