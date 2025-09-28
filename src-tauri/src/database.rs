use once_cell::sync::Lazy;
use rusqlite::{Connection, Result};
use std::sync::Mutex;
// <--- ВАЖНОЕ ИЗМЕНЕНИЕ ЗДЕСЬ: импортируем AppHandle и Manager
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

// Глобальная, потокобезопасная ссылка на подключение к БД
static DB: Lazy<Mutex<Option<Connection>>> = Lazy::new(|| Mutex::new(None));

#[derive(Serialize, Deserialize, Clone)]
pub struct GameEntry {
    pub path: String,
    pub name: String,
    pub game_type: String,
    pub play_time_seconds: i64,
    pub icon_path: Option<String>,
    pub description: Option<String>,
    pub version: Option<String>,
    pub last_played: Option<String>,
    pub rating: i32,
    pub is_hidden: bool,
    pub completion_percent: i32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Folder {
    pub id: i64,
    pub name: String,
}

// Функция для инициализации БД
pub fn init(app_handle: &AppHandle) {
    // Теперь app_handle.path() будет работать, так как мы импортировали Manager
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Failed to get app data dir");
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
            last_played TEXT,
            rating INTEGER DEFAULT 0,
            is_hidden BOOLEAN DEFAULT FALSE,
            completion_percent INTEGER DEFAULT 0
        )",
        [],
    )
    .expect("Failed to create table");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    )",
        [],
    )
    .expect("Failed to create table");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS game_folders (
            game_path TEXT NOT NULL,
            folder_id INTEGER NOT NULL,
            FOREIGN KEY(game_path) REFERENCES games(path) ON DELETE CASCADE,
            FOREIGN KEY(folder_id) REFERENCES folders(id) ON DELETE CASCADE,
            PRIMARY KEY (game_path, folder_id)
        )",
        [],
    )
    .expect("Failed to create game_folders table");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )",
        [],
    )
    .expect("Failed to create settings table");

    // --- Инициализация настроек по умолчанию ---
    // Вставляем значения, только если их еще нет
    conn.execute(
        "INSERT OR IGNORE INTO settings (key, value) VALUES (?1, ?2)",
        ("gridSize", "medium"), // small, medium, large
    )
    .expect("Failed to insert default settings");
    conn.execute(
        "INSERT OR IGNORE INTO settings (key, value) VALUES (?1, ?2)",
        ("theme", "dark"), // dark, light
    )
    .expect("Failed to insert default settings");
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
                rating: row.get(8)?,
                is_hidden: row.get(9)?,
                completion_percent: row.get(10)?,
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
pub fn db_update_game_playtime(path: String, session_seconds: i64) -> Result<(), String> {
    with_db(|conn| {
        // Увеличиваем общее время на время последней сессии и обновляем дату
        conn.execute(
            "UPDATE games SET play_time_seconds = play_time_seconds + ?2, last_played = strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime') WHERE path = ?1",
            (path, session_seconds),
        )?;
        Ok(())
    })
}

#[tauri::command]
pub fn db_toggle_game_hidden(path: String, is_hidden: bool) -> Result<(), String> {
    with_db(|conn| {
        conn.execute(
            "UPDATE games SET is_hidden = ?2 WHERE path = ?1",
            (path, is_hidden),
        )?;
        Ok(())
    })
}

#[tauri::command]
pub fn db_update_game_rating(path: String, rating: i32) -> Result<(), String> {
    with_db(|conn| {
        conn.execute(
            "UPDATE games SET rating = ?2 WHERE path = ?1",
            (path, rating),
        )?;
        Ok(())
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

#[tauri::command]
pub fn db_update_game_icon(path: String, icon_path: String) -> Result<(), String> {
    with_db(|conn| {
        conn.execute(
            "UPDATE games SET icon_path = ?2 WHERE path = ?1",
            (path, icon_path),
        )?;
        Ok(())
    })
}

#[tauri::command]
pub fn db_add_game(game: GameEntry) -> Result<(), String> {
    with_db(|conn| {
        conn.execute(
            // Добавляем версию при вставке
            "INSERT OR IGNORE INTO games (path, name, game_type, version) VALUES (?1, ?2, ?3, ?4)",
            (&game.path, &game.name, &game.game_type, &game.version),
        )?;
        Ok(())
    })
}

#[tauri::command]
pub fn db_update_game_version(path: String, version: String) -> Result<(), String> {
    with_db(|conn| {
        conn.execute(
            "UPDATE games SET version = ?2 WHERE path = ?1",
            (path, version),
        )?;
        Ok(())
    })
}

#[tauri::command]
pub fn db_update_game_name(path: String, name: String) -> Result<(), String> {
    with_db(|conn| {
        conn.execute("UPDATE games SET name = ?2 WHERE path = ?1", (path, name))?;
        Ok(())
    })
}

#[tauri::command]
pub fn db_create_folder(name: String) -> Result<i64, String> {
    with_db(|conn| {
        conn.execute("INSERT INTO folders (name) VALUES (?1)", [name])?;
        Ok(conn.last_insert_rowid())
    })
}

#[tauri::command]
pub fn db_get_all_folders() -> Result<Vec<Folder>, String> {
    with_db(|conn| {
        let mut stmt = conn.prepare("SELECT id, name FROM folders ORDER BY name")?;
        let folder_iter = stmt.query_map([], |row| {
            Ok(Folder {
                id: row.get(0)?,
                name: row.get(1)?,
            })
        })?;

        let mut folders = Vec::new();
        for folder in folder_iter {
            folders.push(folder.unwrap());
        }
        Ok(folders)
    })
}

#[tauri::command]
pub fn db_add_game_to_folder(game_path: String, folder_id: i64) -> Result<(), String> {
    with_db(|conn| {
        conn.execute(
            "INSERT OR IGNORE INTO game_folders (game_path, folder_id) VALUES (?1, ?2)",
            (game_path, folder_id),
        )?;
        Ok(())
    })
}

#[tauri::command]
pub fn db_remove_game_from_folder(game_path: String, folder_id: i64) -> Result<(), String> {
    with_db(|conn| {
        conn.execute(
            "DELETE FROM game_folders WHERE game_path = ?1 AND folder_id = ?2",
            (game_path, folder_id),
        )?;
        Ok(())
    })
}

#[tauri::command]
pub fn db_get_games_by_folder(folder_id: i64) -> Result<Vec<GameEntry>, String> {
    with_db(|conn| {
        let mut stmt = conn.prepare(
            "SELECT g.* FROM games g
             JOIN game_folders gf ON g.path = gf.game_path
             WHERE gf.folder_id = ?1",
        )?;
        let game_iter = stmt.query_map([folder_id], |row| {
            Ok(GameEntry {
                path: row.get(0)?,
                name: row.get(1)?,
                game_type: row.get(2)?,
                play_time_seconds: row.get(3)?,
                icon_path: row.get(4)?,
                description: row.get(5)?,
                version: row.get(6)?,
                last_played: row.get(7)?,
                rating: row.get(8)?,
                is_hidden: row.get(9)?,
                completion_percent: row.get(10)?,
            })
        })?;

        let mut games = Vec::new();
        for game in game_iter {
            games.push(game.unwrap());
        }
        Ok(games)
    })
}

// Новая команда, чтобы узнать, в каких папках состоит игра
#[tauri::command]
pub fn db_get_folders_for_game(game_path: String) -> Result<Vec<i64>, String> {
    with_db(|conn| {
        let mut stmt = conn.prepare("SELECT folder_id FROM game_folders WHERE game_path = ?1")?;
        let ids_iter = stmt.query_map([game_path], |row| row.get(0))?;

        let mut ids = Vec::new();
        for id in ids_iter {
            ids.push(id.unwrap());
        }
        Ok(ids)
    })
}

#[tauri::command]
pub fn db_delete_game(path: String) -> Result<(), String> {
    with_db(|conn| {
        conn.execute("DELETE FROM games WHERE path = ?1", [path.clone()])?;
        // Также удаляем игру из всех папок, если она там была
        conn.execute(
            "DELETE FROM game_folders WHERE game_path = ?1",
            [path.clone()],
        )?;
        Ok(())
    })
}

#[tauri::command]
pub fn db_get_setting(key: String) -> Result<Option<String>, String> {
    with_db(|conn| {
        let mut stmt = conn.prepare("SELECT value FROM settings WHERE key = ?1")?;
        let mut rows = stmt.query_map([key], |row| row.get(0))?;
        if let Some(value_result) = rows.next() {
            Ok(Some(value_result.unwrap()))
        } else {
            Ok(None)
        }
    })
}

#[tauri::command]
pub fn db_set_setting(key: String, value: String) -> Result<(), String> {
    with_db(|conn| {
        // INSERT OR REPLACE обновит значение, если ключ существует, или создаст новое
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
            (key, value),
        )?;
        Ok(())
    })
}

#[tauri::command]
pub fn db_update_game_completion(path: String, percent: i32) -> Result<(), String> {
    with_db(|conn| {
        conn.execute(
            "UPDATE games SET completion_percent = ?2 WHERE path = ?1",
            (path, percent),
        )?;
        Ok(())
    })
}