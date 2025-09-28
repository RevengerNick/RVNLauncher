// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
// Объявляем наш модуль для работы с БД

use tauri::image::Image;
use image::{DynamicImage, ImageFormat, RgbaImage};
use tauri::{AppHandle, Manager};
use tauri_plugin_clipboard_manager::ClipboardExt;

mod database;
mod commands;

#[tauri::command]
async fn save_image_from_clipboard(app: AppHandle, game_path: String) -> Result<String, String> {
    let clipboard = app.clipboard();
    let image: Image = clipboard
        .read_image()
        .map_err(|e| e.to_string())?;

    // --- Логика сохранения (похожа на ту, что в icon-manager.ts) ---
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let icons_dir = "icons";
    
    // Создаем папку icons, если ее нет
    let icons_dir_path = app_data_dir.join(icons_dir);
    if !icons_dir_path.exists() {
        std::fs::create_dir_all(&icons_dir_path).map_err(|e| e.to_string())?;
    }
    
    // Создаем уникальное имя файла. PNG - хороший универсальный формат.
    let safe_game_path = game_path.replace(|c: char| !c.is_alphanumeric(), "_");
    let new_file_name = format!("{}.png", safe_game_path);
    let destination_path = icons_dir_path.join(&new_file_name);
    
    // Сохраняем изображение в файл как PNG с помощью crate `image`
    let width = image.width();
    let height = image.height();
    let rgba = image.rgba(); // RGBA8888, row-major

    let rgba_img: RgbaImage = RgbaImage::from_raw(width, height, rgba.to_vec())
        .ok_or_else(|| "Некорректные данные изображения из буфера обмена".to_string())?;
    let dyn_img = DynamicImage::ImageRgba8(rgba_img);
    dyn_img
        .save_with_format(&destination_path, ImageFormat::Png)
        .map_err(|e| e.to_string())?;

    // Возвращаем относительный путь
    Ok(format!("{}\\{}", icons_dir, new_file_name))
}



// Главная функция, которая собирает и запускает приложение
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            // Инициализируем БД при запуске
            database::init(&app.handle());
            Ok(())
        })
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        // Регистрируем ВСЕ команды здесь
        .invoke_handler(tauri::generate_handler![
            commands::scanner::scan_for_games_recursively,
            
            // Команды из модуля backups
            commands::backups::backup_saves,
            commands::backups::list_backups,
            commands::backups::delete_backup,
            commands::backups::restore_backup,
            save_image_from_clipboard,
            database::db_add_game,
            database::db_get_games,
            database::db_update_game_description,
            database::db_update_game_icon,
            database::db_update_game_playtime,
            database::db_update_game_rating,
            database::db_update_game_version,
            database::db_update_game_name,
            database::db_toggle_game_hidden,
            database::db_create_folder,
            database::db_get_all_folders,
            database::db_add_game_to_folder,
            database::db_remove_game_from_folder,
            database::db_get_folders_for_game,
            database::db_delete_game,
            database::db_get_setting,
            database::db_set_setting,
            database::db_update_game_completion,

        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}