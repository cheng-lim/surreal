use crate::database::t_images;

#[tauri::command]
pub async fn delete_image(image_id: &str) -> Result<(), ()> {
  t_images::delete(image_id);
  Ok(())
}
