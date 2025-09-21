// // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
// mod database;

// use serde::Serialize;
// use walkdir::{DirEntry, WalkDir};
// use std::collections::HashMap;

// #[derive(Debug, Serialize, Clone)]
// struct GameInfo {
//     name: String,
//     path: String,
//     game_type: String,
// }


// fn is_in_blacklist(entry: &DirEntry, dir_blacklist: &[String]) -> bool {
//     if let Some(file_name) = entry.file_name().to_str() {
//         return dir_blacklist.contains(&file_name.to_lowercase());
//     }
//     false
// }

// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }

// #[tauri::command]
// // --- ИЗМЕНЕНИЕ: Убираем ScanArgs, принимаем аргументы напрямую ---
// async fn scan_for_games_recursively(
//     path: String,
//     deep_search: bool,
//     dir_blacklist: Vec<String>,
//     file_blacklist: Vec<String>,
// ) -> Result<Vec<GameInfo>, String> {
    
//     let mut potential_games_by_dir: HashMap<String, Vec<GameInfo>> = HashMap::new();
//     let executable_extensions = ["exe", "py", "sh", "bat", "cmd"];

//     let max_depth = if deep_search { usize::MAX } else { 3 };

//     let walker = WalkDir::new(path)
//         .max_depth(max_depth)
//         .into_iter()
//         .filter_entry(|e| !is_in_blacklist(e, &dir_blacklist));

//     for entry in walker.filter_map(|e| e.ok()) {
//         if entry.file_type().is_file() {
//             if let Some(extension) = entry.path().extension().and_then(|s| s.to_str()) {
//                 if executable_extensions.contains(&extension.to_lowercase().as_str()) {
//                     let file_name = entry.file_name().to_string_lossy().to_string();

//                     if file_blacklist.contains(&file_name.to_lowercase()) {
//                         continue;
//                     }
                    
//                     let full_path = entry.path().to_string_lossy().to_string();
//                     if let Some(parent) = entry.path().parent() {
//                         let parent_dir = parent.to_string_lossy().to_string();

//                         let game_info = GameInfo {
//                             name: file_name,
//                             path: full_path,
//                             game_type: extension.to_lowercase(),
//                         };

//                         potential_games_by_dir.entry(parent_dir).or_default().push(game_info);
//                     }
//                 }
//             }
//         }
//     }

//     // --- Фаза 2: Фильтрация дубликатов ---
//     let mut final_games = Vec::new();
//     for (_dir, games_in_dir) in potential_games_by_dir {
//         let mut game_groups: HashMap<String, Vec<GameInfo>> = HashMap::new();

//         for game in games_in_dir {
//             let base_name = game.name
//                 .rsplitn(2, '.')
//                 .nth(1)
//                 .unwrap_or(&game.name)
//                 .trim_end_matches("-32")
//                 .to_lowercase();
            
//             game_groups.entry(base_name).or_default().push(game);
//         }

//         for (_base_name, group) in game_groups {
//             let best_game = group.iter()
//                 .min_by_key(|g| {
//                     match g.game_type.as_str() {
//                         "exe" if !g.name.to_lowercase().contains("-32") => 0,
//                         "exe" => 1,
//                         "sh" => 2,
//                         "bat" | "cmd" => 3,
//                         "py" => 4,
//                         _ => 5,
//                     }
//                 });

//             if let Some(game) = best_game {
//                 final_games.push(game.clone());
//             }
//         }
//     }

//     Ok(final_games)
// }


// #[cfg_attr(mobile, tauri::mobile_entry_point)]
// pub fn run() {
//     tauri::Builder::default()
//         .plugin(tauri_plugin_os::init())
//         .plugin(tauri_plugin_fs::init())
//         .plugin(tauri_plugin_dialog::init())
//         .plugin(tauri_plugin_shell::init())
//         .plugin(tauri_plugin_opener::init()) // Убедись, что opener плагин добавлен, если он используется
//         .invoke_handler(tauri::generate_handler![greet, scan_for_games_recursively])
//         .run(tauri::generate_context!())
//         .expect("error while running tauri application");
// }
