use image::{delete, fetch};
use utils::version;

pub mod compression;
pub mod database;
pub mod image;
pub mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      compression::compress,
      compression::save_compressed,
      fetch::get_image_urls,
      delete::delete_image,
      version::get_version,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
