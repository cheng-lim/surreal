use dirs::data_local_dir;
use std::{fs, path::PathBuf};

const SQLITE3_PATH: &str = "com.surreal.photos/sqlite3/main.sqlite3";

pub fn open() -> rusqlite::Connection {
  let dir: PathBuf = data_local_dir().unwrap();
  let sqlite_path = dir.join(SQLITE3_PATH);

  let conn = rusqlite::Connection::open(&sqlite_path).unwrap();
  conn
}

pub fn init() {
  let dir: PathBuf = data_local_dir().unwrap();
  let sqlite_path = dir.join(SQLITE3_PATH);

  if let Some(parent) = sqlite_path.parent() {
    fs::create_dir_all(parent)
      .map_err(|e| format!("Failed to create directories: {}", e))
      .unwrap();
  }

  let conn = rusqlite::Connection::open(&sqlite_path).unwrap();

  let stmt = "CREATE TABLE IF NOT EXISTS images (
    image_id TEXT PRIMARY KEY,
    added_date INTEGER NOT NULL
    )";

  conn.execute(stmt, []).unwrap();
}
