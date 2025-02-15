use base64::{engine::general_purpose, Engine};

use ravif;
use rgb::FromSlice;

use crate::database::t_images;

#[tauri::command]
pub async fn compress(image: Vec<u8>) -> String {
  let (quality, speed) = (90.0, 10);

  let img = image::load_from_memory(&image)
    .map_err(|e| format!("Failed to decode image: {}", e))
    .unwrap();

  let rgba = img.to_rgba8();
  let (width, height) = rgba.dimensions();

  let rgba_bytes = rgba.as_raw();
  let rgba_pixels = rgba_bytes.as_rgba();

  let img = ravif::Img::new(rgba_pixels, width as usize, height as usize);

  let encoder = ravif::Encoder::new()
    .with_quality(quality)
    .with_speed(speed);

  let avif = encoder.encode_rgba(img).unwrap();
  let base64_data = general_purpose::STANDARD.encode(avif.avif_file);
  base64_data
}

#[tauri::command]
pub async fn save_compressed(image_id: &str) -> Result<(), ()> {
  t_images::insert(image_id);
  Ok(())
}
