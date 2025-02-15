use tauri::AppHandle;

#[tauri::command]
pub async fn get_version(app: AppHandle) -> String {
  let version = app.package_info().version.to_string();
  version
}
