use std::collections::HashMap;
use serde::Serialize;
use walkdir::{DirEntry, WalkDir};

#[derive(Debug, Serialize, Clone)]
pub struct GameInfo {
    name: String,
    path: String,
    game_type: String,
    version: Option<String>,
}

// Вспомогательная функция для проверки, находится ли запись в черном списке
pub fn is_in_blacklist(entry: &DirEntry, dir_blacklist: &[String]) -> bool {
    if let Some(file_name) = entry.file_name().to_str() {
        return dir_blacklist.contains(&file_name.to_lowercase());
    }
    false
}

#[tauri::command]
pub async fn scan_for_games_recursively(
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

                        potential_games_by_dir
                            .entry(parent_dir)
                            .or_default()
                            .push(game_info);
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
            let base_name = game
                .name
                .rsplitn(2, '.')
                .nth(1)
                .unwrap_or(&game.name)
                .trim_end_matches("-32")
                .to_lowercase();

            game_groups.entry(base_name).or_default().push(game);
        }

        for (_base_name, group) in game_groups {
            let best_game = group.iter().min_by_key(|g| match g.game_type.as_str() {
                "exe" if !g.name.to_lowercase().contains("-32") => 0,
                "exe" => 1,
                "sh" => 2,
                "bat" | "cmd" => 3,
                "py" => 4,
                _ => 5,
            });

            if let Some(game) = best_game {
                final_games.push(game.clone());
            }
        }
    }

    Ok(final_games)
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
    if let Some(file_name) = std::path::Path::new(path_str)
        .file_name()
        .and_then(|s| s.to_str())
    {
        if let Some(version) = find_version_in_name(file_name) {
            return Some(version);
        }
    }

    None
}
