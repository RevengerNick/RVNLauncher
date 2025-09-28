// Включаем сгенерированный клиент Prisma в наш модуль
#[allow(warnings, unused)]
pub mod prisma {
    // Эта строка может вызывать ошибку в некоторых IDE, но `cargo build` ее поймет.
    // Она ссылается на файл, который будет создан в `target/debug/build/...`
    include!(concat!(env!("OUT_DIR"), "/prisma.rs"));
}

use std::sync::Arc;
use tauri::{AppHandle, Manager, State};
// Импортируем все из нашего prisma модуля, включая типы данных (game, folder)
use prisma::*;

// Тип для State, чтобы безопасно передавать клиент в команды
pub type PrismaClientState = Arc<PrismaClient>;

// Функция инициализации. Теперь она просто создает клиент и запускает миграции.
pub async fn init(app_handle: &AppHandle) -> PrismaClientState {
    let app_dir = app_handle.path().app_data_dir().expect("Failed to get app data dir");
    
    // Prisma по умолчанию создает папку `prisma` внутри `AppData`
    let db_dir = app_dir.join("prisma");
    if !db_dir.exists() {
        std::fs::create_dir_all(&db_dir).expect("Failed to create prisma dir");
    }

    let db_path = db_dir.join("launcher.db");
    println!("Database path: {:?}", db_path);

    let client = PrismaClient::_builder()
        .with_url(format!("file:{}", db_path.to_string_lossy()))
        .build()
        .await
        .expect("Failed to build Prisma client");

    // Запускаем миграции при старте. Это безопасно и идемпотентно.
    client._migrate_dev().await.expect("Failed to migrate database");
    
    // Инициализируем настройки по умолчанию
    client.setting().upsert(
        setting::key::equals("theme".to_string()),
        setting::create("theme".to_string(), "dark".to_string(), vec![]),
        vec![setting::value::set("dark".to_string())],
    ).exec().await.expect("Failed to set default theme");
    client.setting().upsert(
        setting::key::equals("gridSize".to_string()),
        setting::create("gridSize".to_string(), "4".to_string(), vec![]),
        vec![setting::value::set("4".to_string())],
    ).exec().await.expect("Failed to set default gridSize");

    println!("Prisma client initialized and migrations applied.");
    Arc::new(client)
}

// --- КОМАНДЫ, ПЕРЕПИСАННЫЕ ПОД PRISMA ---
// Примечание: Prisma автоматически генерирует типы данных, например `game::Data`.
// Мы возвращаем их напрямую, JS-сторона получит JSON.

#[tauri::command]
pub async fn db_get_all_games(client: State<'_, PrismaClientState>) -> Result<Vec<game::Data>, String> {
    client.game().find_many(vec![]).exec().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_update_game_playtime(path: String, session_seconds: i64, client: State<'_, PrismaClientState>) -> Result<game::Data, String> {
    client.game().update(
        game::path::equals(path),
        vec![
            game::play_time_seconds::increment(session_seconds as i32),
            game::last_played::set(Some(chrono::Local::now().to_rfc3339())),
        ]
    ).exec().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_toggle_game_hidden(path: String, is_hidden: bool, client: State<'_, PrismaClientState>) -> Result<game::Data, String> {
    client.game().update(game::path::equals(path), vec![game::is_hidden::set(is_hidden)]).exec().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_update_game_rating(path: String, rating: i32, client: State<'_, PrismaClientState>) -> Result<game::Data, String> {
    client.game().update(game::path::equals(path), vec![game::rating::set(rating)]).exec().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_update_game_description(path: String, description: String, client: State<'_, PrismaClientState>) -> Result<game::Data, String> {
    client.game().update(game::path::equals(path), vec![game::description::set(Some(description))]).exec().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_update_game_icon(path: String, icon_path: String, client: State<'_, PrismaClientState>) -> Result<game::Data, String> {
    client.game().update(game::path::equals(path), vec![game::icon_path::set(Some(icon_path))]).exec().await.map_err(|e| e.to_string())
}

// В Prisma мы не можем использовать IGNORE, поэтому сначала проверяем наличие
#[tauri::command]
pub async fn db_add_game(game: game::Data, client: State<'_, PrismaClientState>) -> Result<game::Data, String> {
    client.game().upsert(
        game::path::equals(game.path.clone()),
        (
            game.path,
            game.name,
            game.game_type,
            vec![
                game::version::set(game.version),
            ],
        ),
        vec![] // Не обновлять, если существует
    ).exec().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_update_game_version(path: String, version: String, client: State<'_, PrismaClientState>) -> Result<game::Data, String> {
    client.game().update(game::path::equals(path), vec![game::version::set(Some(version))]).exec().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_update_game_name(path: String, name: String, client: State<'_, PrismaClientState>) -> Result<game::Data, String> {
    client.game().update(game::path::equals(path), vec![game::name::set(name)]).exec().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_create_folder(name: String, client: State<'_, PrismaClientState>) -> Result<folder::Data, String> {
    client.folder().create(name, vec![]).exec().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_get_all_folders(client: State<'_, PrismaClientState>) -> Result<Vec<folder::Data>, String> {
    client.folder().find_many(vec![]).order_by(folder::name::order(Direction::Asc)).exec().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_add_game_to_folder(game_path: String, folder_id: i32, client: State<'_, PrismaClientState>) -> Result<game_folder::Data, String> {
    client.game_folder().create(
        game::path::equals(game_path),
        folder::id::equals(folder_id),
        vec![]
    ).exec().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_remove_game_from_folder(game_path: String, folder_id: i32, client: State<'_, PrismaClientState>) -> Result<game_folder::Data, String> {
    client.game_folder().delete(
        game_folder::game_path_folder_id(game_path, folder_id)
    ).exec().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_get_games_by_folder(folder_id: i32, client: State<'_, PrismaClientState>) -> Result<Vec<game::Data>, String> {
    client.game().find_many(vec![
        game::folders::some(vec![
            game_folder::folder_id::equals(folder_id)
        ])
    ]).exec().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_get_folders_for_game(game_path: String, client: State<'_, PrismaClientState>) -> Result<Vec<i32>, String> {
    let game_folders = client.game_folder().find_many(vec![
        game_folder::game_path::equals(game_path)
    ]).exec().await.map_err(|e| e.to_string())?;
    
    Ok(game_folders.into_iter().map(|gf| gf.folder_id).collect())
}

#[tauri::command]
pub async fn db_delete_game(path: String, client: State<'_, PrismaClientState>) -> Result<game::Data, String> {
    // Prisma автоматически удалит связанные записи в game_folders из-за `onDelete: Cascade`
    client.game().delete(game::path::equals(path)).exec().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_get_setting(key: String, client: State<'_, PrismaClientState>) -> Result<Option<setting::Data>, String> {
    client.setting().find_unique(setting::key::equals(key)).exec().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_set_setting(key: String, value: String, client: State<'_, PrismaClientState>) -> Result<setting::Data, String> {
    client.setting().upsert(
        setting::key::equals(key.clone()),
        setting::create(key, value.clone(), vec![]),
        vec![setting::value::set(value)]
    ).exec().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_update_game_completion(path: String, percent: i32, client: State<'_, PrismaClientState>) -> Result<game::Data, String> {
    client.game().update(game::path::equals(path), vec![game::completion_percent::set(percent)]).exec().await.map_err(|e| e.to_string())
}