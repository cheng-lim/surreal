use crate::database::t_images;

#[tauri::command]
pub async fn get_image_urls() -> Vec<String> {
  t_images::select_all()
}
