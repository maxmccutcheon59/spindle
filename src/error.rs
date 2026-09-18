//! Error types for Spindle.

use std::io;
use std::path::PathBuf;

use thiserror::Error;

/// Convenient result alias.
pub type Result<T> = std::result::Result<T, Error>;

/// All Spindle errors.
#[derive(Debug, Error)]
pub enum Error {
    /// Underlying I/O failure.
    #[error("io error: {0}")]
    Io(#[from] io::Error),

    /// Corruption detected in on-disk structures.
    #[error("corruption: {0}")]
    Corruption(String),

    /// Invalid argument or configuration.
    #[error("invalid argument: {0}")]
    InvalidArgument(String),

    /// Database directory is locked by another process.
    #[error("database locked: {0}")]
    Locked(PathBuf),

    /// Compaction or background worker failure.
    #[error("background error: {0}")]
    Background(String),
}
