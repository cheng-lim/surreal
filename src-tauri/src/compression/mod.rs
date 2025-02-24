use base64::{engine::general_purpose, Engine};

use ravif;
use rgb::FromSlice;

use crate::database::t_images;

#[tauri::command]
pub async fn compress(image: Vec<u8>) -> Result<String, String> {
  let (quality, speed) = (90.0, 10);

  let img = match image::load_from_memory(&image) {
    Ok(image) => image,
    Err(e) => return Err(format!("Failed to decode image: {}", e)),
  };

  let rgba = img.to_rgba8();
  let (width, height) = rgba.dimensions();

  let rgba_bytes = rgba.as_raw();
  let rgba_pixels = rgba_bytes.as_rgba();

  let img = ravif::Img::new(rgba_pixels, width as usize, height as usize);

  let encoder = ravif::Encoder::new()
    .with_quality(quality)
    .with_speed(speed);

  let avif = match encoder.encode_rgba(img) {
    Ok(encoded) => encoded,
    Err(e) => return Err(format!("Failed to encode rgba: {}", e)),
  };

  let base64_data = general_purpose::STANDARD.encode(avif.avif_file);
  Ok(base64_data)
}

#[tauri::command]
pub async fn save_compressed(image_id: &str) -> Result<(), String> {
  match t_images::insert(image_id) {
    Ok(_) => Ok(()),
    Err(e) => Err(format!("Failed to save compressed: {}", e)),
  }
}
