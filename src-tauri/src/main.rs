// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use app_lib::database::sqlite3;
fn main() {
  sqlite3::init();
  app_lib::run();
}
