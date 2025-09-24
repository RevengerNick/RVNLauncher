// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
// Объявляем наш модуль для работы с БД
mod database;
use serde::{Serialize};
use walkdir::{DirEntry, WalkDir};
use std::collections::HashMap;
use std::path::{Path};
use std::io::{Read, Write};
use zip::write::{FileOptions, ZipWriter};
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Clone)]
struct GameInfo {
    name: String,
    path: String,
    game_type: String,
    version: Option<String>,
}

#[tauri::command]
async fn backup_saves(app: AppHandle, game_path: String) -> Result<String, String> {
    // 1. Определяем путь к сохранениям Ren'Py
    let app_data_dir = app.path().app_data_dir().expect("Не удалось найти AppData");
    
    // Извлекаем имя папки с игрой из полного пути к .exe
    // Пример: E:\Games\MyGame\MyGame.exe -> MyGame
    let game_folder_name = Path::new(&game_path)
        .parent().expect("Не найден родительский каталог игры")
        .file_name().expect("Не найдено имя каталога игры")
        .to_str().expect("Некорректное имя каталога игры");
    
    // Собираем путь к папке сохранений Ren'Py
    let saves_dir = Path::new(&game_path)
        .parent().expect("Не найден родительский каталог игры")
        .join("game")
        .join("saves");
        
    if !saves_dir.exists() {
        return Err(format!("Папка сохранений не найдена: {:?}", saves_dir));
    }

    // 2. Создаем папку для бэкапов, если ее нет
    let backup_root_dir = app_data_dir.join("backups");
    std::fs::create_dir_all(&backup_root_dir).map_err(|e| e.to_string())?;

    // 3. Создаем ZIP-архив
    let timestamp = chrono::Local::now().format("%Y-%m-%d_%H-%M-%S").to_string();
    let backup_file_name = format!("{}_{}.zip", game_folder_name, timestamp);
    let backup_path = backup_root_dir.join(backup_file_name);
    let file = std::fs::File::create(&backup_path).map_err(|e| e.to_string())?;
    
    let mut zip = ZipWriter::new(file);
    let options: FileOptions<'_, ()> = FileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated);

    // Рекурсивно добавляем файлы в архив
    let walker = WalkDir::new(&saves_dir).into_iter();
    for entry in walker.filter_map(|e| e.ok()) {
        let path = entry.path();
        let name = path.strip_prefix(Path::new(&saves_dir)).unwrap();
        
        if path.is_file() {
            zip.start_file(name.to_str().unwrap(), options).map_err(|e| e.to_string())?;
            let mut f = std::fs::File::open(path).map_err(|e| e.to_string())?;
            let mut buffer = Vec::new();
            f.read_to_end(&mut buffer).map_err(|e| e.to_string())?;
            zip.write_all(&buffer).map_err(|e| e.to_string())?;
        } else if !name.as_os_str().is_empty() {
            zip.add_directory(name.to_str().unwrap(), options).map_err(|e| e.to_string())?;
        }
    }
    
    zip.finish().map_err(|e| e.to_string())?;

    Ok(format!("Бэкап успешно создан: {:?}", backup_path))
}

fn extract_version_from_path(path_str: &str) -> Option<String> {
    
    // Функция, которая будет анализировать строку (имя файла или папки)
    fn find_version_in_name(name: &str) -> Option<String> {
        // Разделители, по которым будем бить строку
        let delimiters = &['-', '_', ' '];
        let mut version_parts = Vec::new();
        let mut found_version_start = false;

        // Разбиваем имя на компоненты
        for part in name.split(delimiters) {
            // Если в компоненте есть хотя бы одна цифра, считаем, что это часть версии
            if part.chars().any(|c| c.is_digit(10)) {
                // Игнорируем слишком короткие части, которые могут быть просто артиклями (например, "a1")
                // или чисто цифровые, если это не первая часть версии (чтобы не захватить "-32" отдельно)
                if part.len() > 1 || found_version_start {
                    version_parts.push(part);
                    found_version_start = true;
                }
            } else {
                // Если мы уже начали собирать версию и встретили компонент без цифр,
                // скорее всего, версия закончилась (например, ...-pc-Rus).
                // Но мы продолжим, чтобы захватить суффиксы типа "pc" или "rus"
                if found_version_start {
                    version_parts.push(part);
                }
            }
        }

        if !version_parts.is_empty() {
            // "Склеиваем" найденные части обратно в одну строку, используя дефис
            let version_string = version_parts.join("-");
            // Убираем потенциальный мусор и слишком общие суффиксы
            let cleaned_version = version_string
                .trim_end_matches("-pc")
                .trim_end_matches("-rus")
                .trim_end_matches("-fix")
                .trim_end_matches("-1080p")
                .trim()
                .to_string();

            // Если после очистки что-то осталось, возвращаем
            if !cleaned_version.is_empty() {
                return Some(cleaned_version);
            }
        }
        
        None
    }

    // Сначала ищем в имени родительской папки
    if let Some(parent) = std::path::Path::new(path_str).parent() {
        if let Some(dir_name) = parent.file_name().and_then(|s| s.to_str()) {
            if let Some(version) = find_version_in_name(dir_name) {
                return Some(version);
            }
        }
    }

    // Если в папке не нашли, ищем в имени самого файла
    if let Some(file_name) = std::path::Path::new(path_str).file_name().and_then(|s| s.to_str()) {
        if let Some(version) = find_version_in_name(file_name) {
            return Some(version);
        }
    }
    
    None
}

// Вспомогательная функция для проверки, находится ли запись в черном списке
fn is_in_blacklist(entry: &DirEntry, dir_blacklist: &[String]) -> bool {
    if let Some(file_name) = entry.file_name().to_str() {
        return dir_blacklist.contains(&file_name.to_lowercase());
    }
    false
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn scan_for_games_recursively(
    path: String,
    deep_search: bool,
    dir_blacklist: Vec<String>,
    file_blacklist: Vec<String>,
) -> Result<Vec<GameInfo>, String> {
    
    let mut potential_games_by_dir: HashMap<String, Vec<GameInfo>> = HashMap::new();
    let executable_extensions = ["exe", "py", "sh", "bat", "cmd"];

    let max_depth = if deep_search { usize::MAX } else { 3 };

    let walker = WalkDir::new(path)
        .max_depth(max_depth)
        .into_iter()
        .filter_entry(|e| !is_in_blacklist(e, &dir_blacklist));

    for entry in walker.filter_map(|e| e.ok()) {
        if entry.file_type().is_file() {
            if let Some(extension) = entry.path().extension().and_then(|s| s.to_str()) {
                if executable_extensions.contains(&extension.to_lowercase().as_str()) {
                    let file_name = entry.file_name().to_string_lossy().to_string();

                    if file_blacklist.contains(&file_name.to_lowercase()) {
                        continue;
                    }
                    
                    let full_path = entry.path().to_string_lossy().to_string();
                    if let Some(parent) = entry.path().parent() {
                        let parent_dir = parent.to_string_lossy().to_string();
                    
                        let game_info = GameInfo {
                            name: file_name,
                            path: full_path.clone(), // Клонируем, так как full_path нужен для версии
                            game_type: extension.to_lowercase(),
                            version: extract_version_from_path(&full_path), // <-- ИСПОЛЬЗУЕМ НАШУ НОВУЮ ФУНКЦИЮ
                        };
                    
                        potential_games_by_dir.entry(parent_dir).or_default().push(game_info);
                    }
                }
            }
        }
    }

    // --- Фаза 2: Фильтрация дубликатов ---
    let mut final_games = Vec::new();
    for (_dir, games_in_dir) in potential_games_by_dir {
        let mut game_groups: HashMap<String, Vec<GameInfo>> = HashMap::new();

        for game in games_in_dir {
            let base_name = game.name
                .rsplitn(2, '.')
                .nth(1)
                .unwrap_or(&game.name)
                .trim_end_matches("-32")
                .to_lowercase();
            
            game_groups.entry(base_name).or_default().push(game);
        }

        for (_base_name, group) in game_groups {
            let best_game = group.iter()
                .min_by_key(|g| {
                    match g.game_type.as_str() {
                        "exe" if !g.name.to_lowercase().contains("-32") => 0,
                        "exe" => 1,
                        "sh" => 2,
                        "bat" | "cmd" => 3,
                        "py" => 4,
                        _ => 5,
                    }
                });

            if let Some(game) = best_game {
                final_games.push(game.clone());
            }
        }
    }

    Ok(final_games)
}

// Главная функция, которая собирает и запускает приложение
fn main() {
    tauri::Builder::default()
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
            greet, 
            scan_for_games_recursively,
            backup_saves,
            database::db_add_game,
            database::db_get_all_games,
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
            database::db_get_games_by_folder,
            database::db_get_folders_for_game,
            database::db_delete_game,
            database::db_get_setting,
            database::db_set_setting,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}