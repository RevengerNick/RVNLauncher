use serde::Serialize;
use std::io::{Read, Write};
use std::path::Path;
use std::fs;
use tauri::{AppHandle, Manager};
use walkdir::WalkDir;
use zip::write::{FileOptions, ZipWriter};
use std::time::SystemTime;
use chrono::{DateTime, Local};


#[derive(Debug, Serialize, Clone)]
pub struct BackupInfo {
    file_name: String,
    path: String,
    created_at: String, // Дата в виде строки
}

#[tauri::command]
pub async fn backup_saves(app: AppHandle, game_path: String) -> Result<String, String> {
    // 1. Определяем путь к сохранениям Ren'Py
    let app_data_dir = app.path().app_data_dir().expect("Не удалось найти AppData");

    // Извлекаем имя папки с игрой из полного пути к .exe
    // Пример: E:\Games\MyGame\MyGame.exe -> MyGame
    let game_folder_name = Path::new(&game_path)
        .parent()
        .expect("Не найден родительский каталог игры")
        .file_name()
        .expect("Не найдено имя каталога игры")
        .to_str()
        .expect("Некорректное имя каталога игры");

    // Собираем путь к папке сохранений Ren'Py
    let saves_dir = Path::new(&game_path)
        .parent()
        .expect("Не найден родительский каталог игры")
        .join("game")
        .join("saves");

    if !saves_dir.exists() {
        return Err(format!("Папка сохранений не найдена: {:?}", saves_dir));
    }

    // 2. Создаем папку для бэкапов, если ее нет
    let backup_root_dir = app_data_dir.join("backups");
    std::fs::create_dir_all(&backup_root_dir).map_err(|e| e.to_string())?;

    let backup_game_dir = backup_root_dir.join(game_folder_name);
    std::fs::create_dir_all(&backup_game_dir).map_err(|e| e.to_string())?;

    // 3. Создаем ZIP-архив
    let timestamp = chrono::Local::now().format("%Y-%m-%d_%H-%M-%S").to_string();
    let backup_file_name = format!("{}.zip", timestamp);
    let backup_path = backup_game_dir.join(backup_file_name);
    let file = std::fs::File::create(&backup_path).map_err(|e| e.to_string())?;

    let mut zip = ZipWriter::new(file);
    let options: FileOptions<'_, ()> =
        FileOptions::default().compression_method(zip::CompressionMethod::Deflated);

    // Рекурсивно добавляем файлы в архив
    let walker = WalkDir::new(&saves_dir).into_iter();
    for entry in walker.filter_map(|e| e.ok()) {
        let path = entry.path();
        let name = path.strip_prefix(Path::new(&saves_dir)).unwrap();

        if path.is_file() {
            zip.start_file(name.to_str().unwrap(), options)
                .map_err(|e| e.to_string())?;
            let mut f = std::fs::File::open(path).map_err(|e| e.to_string())?;
            let mut buffer = Vec::new();
            f.read_to_end(&mut buffer).map_err(|e| e.to_string())?;
            zip.write_all(&buffer).map_err(|e| e.to_string())?;
        } else if !name.as_os_str().is_empty() {
            zip.add_directory(name.to_str().unwrap(), options)
                .map_err(|e| e.to_string())?;
        }
    }

    zip.finish().map_err(|e| e.to_string())?;

    Ok(format!("Бэкап успешно создан: {:?}", backup_path))
}

#[tauri::command]
pub async fn list_backups(app: AppHandle, game_path: String) -> Result<Vec<BackupInfo>, String> {
    let app_data_dir = app.path().app_data_dir().expect("Не удалось найти AppData");
    
    // Определяем имя папки игры, чтобы найти папку с ее бэкапами
    let game_folder_name = std::path::Path::new(&game_path)
        .parent().and_then(|p| p.file_name()).and_then(|s| s.to_str())
        .ok_or("Не удалось извлечь имя папки игры")?;
    
    // Путь к папке бэкапов для этой конкретной игры
    let backup_game_dir = app_data_dir.join("backups").join(game_folder_name);
    
    let mut backups = Vec::new();

    if backup_game_dir.exists() {
        for entry in fs::read_dir(backup_game_dir).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            if path.is_file() {
                if let Some(file_name) = path.file_name().and_then(|s| s.to_str()) {
                    if file_name.ends_with(".zip") {
                        let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
                        let created_time: DateTime<Local> = metadata.created().unwrap_or(SystemTime::now()).into();
                        
                        backups.push(BackupInfo {
                            file_name: file_name.to_string(),
                            path: path.to_string_lossy().to_string(),
                            created_at: created_time.format("%Y-%m-%d %H:%M:%S").to_string(),
                        });
                    }
                }
            }
        }
    }

    // Сортируем по дате, новые вверху
    backups.sort_by(|a, b| b.created_at.cmp(&a.created_at));

    Ok(backups)
}

#[tauri::command]
pub async fn delete_backup(backup_path: String) -> Result<(), String> {
    fs::remove_file(backup_path).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn restore_backup(
    app: AppHandle, // AppHandle снова нужен для создания бэкапа
    game_path: String, 
    backup_path: String,
    strategy: String, // "backup", "rename", "delete"
) -> Result<(), String> {
    // 1. Определяем путь к папке сохранений
    let game_dir = Path::new(&game_path)
        .parent()
        .ok_or_else(|| "Не удалось найти родительскую директорию игры".to_string())?;
    let saves_dir = game_dir.join("game").join("saves");

    // 2. Обрабатываем существующие сохранения в соответствии со стратегией
    if saves_dir.exists() {
        match strategy.as_str() {
            "backup" => {
                // Вызываем нашу же команду `backup_saves` для создания архива
                // Это отличный пример переиспользования кода
                backup_saves(app.clone(), game_path.clone()).await?;
                // После бэкапа, удаляем старую папку
                fs::remove_dir_all(&saves_dir).map_err(|e| e.to_string())?;
            },
            "rename" => {
                let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S").to_string();
                let new_name = format!("saves_old_{}", timestamp);
                let renamed_saves_dir = saves_dir.with_file_name(new_name);
                fs::rename(&saves_dir, &renamed_saves_dir).map_err(|e| e.to_string())?;
            },
            "delete" => {
                fs::remove_dir_all(&saves_dir).map_err(|e| e.to_string())?;
            },
            _ => return Err("Неизвестная стратегия восстановления".to_string()),
        }
    }

    // 3. Создаем пустую папку `saves` для распаковки
    fs::create_dir_all(&saves_dir).map_err(|e| e.to_string())?;

    // 4. Распаковываем архив
    let file = fs::File::open(&backup_path).map_err(|e| e.to_string())?;
    let mut archive = zip::ZipArchive::new(file).map_err(|e| e.to_string())?;
    archive.extract(&saves_dir).map_err(|e| e.to_string())?;
    
    Ok(())
}