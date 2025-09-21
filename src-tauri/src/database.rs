use rusqlite::{Connection, Result};
use std::sync::Mutex;
use once_cell::sync::Lazy;
// <--- ВАЖНОЕ ИЗМЕНЕНИЕ ЗДЕСЬ: импортируем AppHandle и Manager
use tauri::{AppHandle, Manager};

// Глобальная, потокобезопасная ссылка на подключение к БД
static DB: Lazy<Mutex<Option<Connection>>> = Lazy::new(|| Mutex::new(None));

// Функция для инициализации БД
pub fn init(app_handle: &AppHandle) {
    // Теперь app_handle.path() будет работать, так как мы импортировали Manager
    let app_dir = app_handle.path().app_data_dir().expect("Failed to get app data dir");
    if !app_dir.exists() {
        std::fs::create_dir_all(&app_dir).expect("Failed to create app data dir");
    }
    let db_path = app_dir.join("launcher.db");

    let conn = Connection::open(&db_path).expect("Failed to open database");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS games (
            path TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            game_type TEXT NOT NULL,
            play_time_seconds INTEGER DEFAULT 0,
            icon_path TEXT,
            description TEXT,
            version TEXT,
            last_played TEXT
        )",
        [],
    ).expect("Failed to create table");

    *DB.lock().unwrap() = Some(conn);
    println!("Database initialized at: {:?}", db_path);
}

// Вспомогательная функция для доступа к подключению
fn with_db<F, T>(func: F) -> Result<T, String>
where
    F: FnOnce(&Connection) -> Result<T>,
{
    let guard = DB.lock().unwrap();
    if let Some(conn) = guard.as_ref() {
        func(conn).map_err(|e| e.to_string())
    } else {
        Err("Database connection not initialized".to_string())
    }
}

// Команды для вызова из JavaScript

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct GameEntry {
    pub path: String,
    pub name: String,
    pub game_type: String,
    pub play_time_seconds: i64,
    pub icon_path: Option<String>,
    pub description: Option<String>,
    pub version: Option<String>,
    pub last_played: Option<String>,
}

#[tauri::command]
pub fn db_add_game(game: GameEntry) -> Result<(), String> {
    with_db(|conn| {
        conn.execute(
            "INSERT OR IGNORE INTO games (path, name, game_type) VALUES (?1, ?2, ?3)",
            (&game.path, &game.name, &game.game_type),
        )?;
        Ok(())
    })
}

#[tauri::command]
pub fn db_get_all_games() -> Result<Vec<GameEntry>, String> {
    with_db(|conn| {
        let mut stmt = conn.prepare("SELECT * FROM games")?;
        let game_iter = stmt.query_map([], |row| {
            Ok(GameEntry {
                path: row.get(0)?,
                name: row.get(1)?,
                game_type: row.get(2)?,
                play_time_seconds: row.get(3)?,
                icon_path: row.get(4)?,
                description: row.get(5)?,
                version: row.get(6)?,
                last_played: row.get(7)?,
            })
        })?;

        let mut games = Vec::new();
        for game in game_iter {
            games.push(game.unwrap());
        }
        Ok(games)
    })
}

#[tauri::command]
pub fn db_update_game_description(path: String, description: String) -> Result<(), String> {
    with_db(|conn| {
        conn.execute(
            "UPDATE games SET description = ?2 WHERE path = ?1",
            (path, description),
        )?;
        Ok(())
    })
}