import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

export interface GameInfo {
  name: string;
  path: string;
  game_type: 'exe' | 'py' | 'sh' | 'bat' | 'cmd';
}

/**
 * Открывает диалог выбора директории.
 */
export async function selectGameDirectory(): Promise<string | null> {
  try {
    const selectedPath = await openDialog({
      directory: true,
      multiple: false,
      title: 'Выберите директорию с играми',
    });
    
    return typeof selectedPath === 'string' ? selectedPath : null;
  } catch (e) {
    console.error('Ошибка при выборе директории:', e);
    return null;
  }
}

/**
 * Вызывает Rust-команду для рекурсивного сканирования директории.
 * @param dirPath Путь к директории для сканирования.
 * @param deepSearch Включить глубокий поиск?
 */
export async function scanForGames(dirPath: string, deepSearch: boolean): Promise<GameInfo[]> {
  try {
    // Определяем блэклисты. Их можно будет настраивать в интерфейсе.
    const dirBlacklist = ['renpy', 'lib', 'python-packages', 'common', 'saves', 'update', 'game', 'python27'];
    const fileBlacklist = [
      'python.exe', 'pythonw.exe', 'zsync.exe', 'zsyncmake.exe', 'librenpy.exe', 'librenpy-32.exe', 'renpy.exe'
    ];

    console.log(`Начинаем сканирование "${dirPath}"... Глубокий поиск: ${deepSearch}`);
    const games = await invoke<GameInfo[]>('scan_for_games_recursively', {
      path: dirPath,
      deepSearch: deepSearch,
      dirBlacklist: dirBlacklist,
      fileBlacklist: fileBlacklist,
    });
    
    console.log(`Сканирование завершено. Найдено ${games.length} игр.`);
    return games;
  } catch (error) {
    console.error(`Ошибка при сканировании директории ${dirPath}:`, error);
    return [];
  }
}