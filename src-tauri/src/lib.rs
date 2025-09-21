// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use tauri::{AppHandle};
use tauri_plugin_fs::{FsExt};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn add_path_to_fs_scope<R: tauri::Runtime>(app: AppHandle<R>, path: String) -> Result<(), String> {
    // Получаем глобальный FsScope менеджер напрямую из AppHandle
    let fs_scope = app.fs_scope(); // ЭТО ПРАВИЛЬНЫЙ СПОСОБ

    // Добавляем новый путь в разрешение на чтение
    // Мы хотим разрешить чтение выбранной директории и всех ее подпапок
    // .map_err(|e| e.to_string()) для преобразования ошибок в String
    fs_scope.allow_file(&path).map_err(|e| e.to_string())?; // Разрешаем доступ к файлу (если это файл)
    fs_scope.allow_directory(&path, true).map_err(|e| e.to_string())?; // Разрешаем доступ к директории и рекурсивно

    println!("Добавлен путь в FS Scope: {}", path);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, add_path_to_fs_scope])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
