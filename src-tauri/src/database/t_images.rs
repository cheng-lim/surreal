use rusqlite::fallible_iterator::FallibleIterator;

use super::sqlite3;

pub fn insert(image_id: &str) -> Result<(), rusqlite::Error> {
  let conn = sqlite3::open();
  let stmt = "INSERT INTO images (image_id, added_date) VALUES ($1, CURRENT_TIMESTAMP)";
  match conn.execute(stmt, [image_id]) {
    Ok(_) => Ok(()),
    Err(e) => Err(e),
  }
}

pub fn delete(image_id: &str) {
  let conn = sqlite3::open();
  let stmt = "DELETE FROM images WHERE image_id = $1";
  conn.execute(stmt, [image_id]).unwrap();
}

pub fn select_all() -> Vec<String> {
  let conn = sqlite3::open();
  let query = "SELECT image_id FROM images ORDER BY added_date DESC";
  let mut stmt = conn.prepare(query).unwrap();
  let rows = stmt.query([]).unwrap();

  let image_ids: Vec<String> = rows
    .map(|row| {
      let image_id: String = row.get(0).unwrap();
      Ok(image_id)
    })
    .collect()
    .unwrap();

  image_ids
}
