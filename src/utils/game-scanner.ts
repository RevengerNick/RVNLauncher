import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { readDir } from '@tauri-apps/plugin-fs';
import { BaseDirectory, join } from '@tauri-apps/api/path'; // <--- Теперь join будет использоваться активно!
import { platform } from '@tauri-apps/plugin-os';

const EXECUTABLE_EXTENSIONS = [
  'exe', 'py', 'sh', 'bat', 'cmd'
];

export interface GameInfo {
  name: string;
  path: string;
  type: 'exe' | 'py' | 'sh' | 'bat' | 'cmd' | 'unknown';
}

/**
 * Открывает диалог выбора директории и возвращает выбранный путь.
 */
export async function selectGameDirectory(): Promise<string | null> {
  try {
    const selectedPath = await openDialog({
      directory: true,
      multiple: false,
      title: 'Выберите директорию с играми',
    });
    
    if (typeof selectedPath === 'string') {
      console.log('Выбрана директория:', selectedPath);
      return selectedPath;
    } else {
      console.log('Выбор директории отменен.');
      return null;
    }
  } catch (e) {
    console.error('Ошибка при выборе директории:', e);
    return null;
  }
}

/**
 * Рекурсивно сканирует директорию на наличие исполняемых файлов,
 * применяя эвристику для выбора лучшей версии игры (например, .exe вместо .py).
 * @param rootDirPath Корневой путь к директории для сканирования.
 */
export async function scanForGames(rootDirPath: string): Promise<GameInfo[]> {
    const games: GameInfo[] = [];
    const currentPlatform = await platform();
    // Очередь директорий для сканирования, каждая запись - полный путь
    const directoriesToScan: string[] = [rootDirPath]; 
  
    while (directoriesToScan.length > 0) {
      const currentDir = directoriesToScan.shift() as string; // Берем следующую директорию
  
      try {
        // Читаем только текущую директорию (без рекурсии)
        // Здесь не используем baseDir, так как currentDir уже является абсолютным путем,
        // и разрешение на него было добавлено в FS Scope.
        const entries = await readDir(currentDir); 
        const potentialGamesInCurrentDir: GameInfo[] = [];
  
        for (const entry of entries) {
          if (!entry.name) continue; // Пропускаем записи без имени
  
          // Всегда используем join для создания полных путей
          const fullPath = await join(currentDir, entry.name);
  
          if (entry.isDirectory) { // Если это директория
            directoriesToScan.push(fullPath); // Добавляем ПОЛНЫЙ ПУТЬ поддиректории в очередь
          } else if (entry.isFile) { // Если это файл
            const fileName = entry.name;
            const extension = fileName.split('.').pop() || '';
            const lowerCaseExtension = extension.toLowerCase();
  
            if (EXECUTABLE_EXTENSIONS.includes(lowerCaseExtension)) {
              let type: GameInfo['type'] = 'unknown';
  
              if (lowerCaseExtension === 'exe' && currentPlatform === 'windows') {
                type = 'exe';
              } else if (lowerCaseExtension === 'py') {
                type = 'py';
              } else if (lowerCaseExtension === 'sh' && (currentPlatform === 'linux' || currentPlatform === 'macos')) {
                type = 'sh';
              } else if ((lowerCaseExtension === 'bat' || lowerCaseExtension === 'cmd') && currentPlatform === 'windows') {
                type = 'bat';
              }
  
              if (type !== 'unknown') {
                potentialGamesInCurrentDir.push({
                  name: fileName,
                  path: fullPath, // <--- ИСПОЛЬЗУЕМ СОБРАННЫЙ ПОЛНЫЙ ПУТЬ
                  type: type,
                });
              }
            }
          }
        }
  
        // --- Логика фильтрации для Ren'Py (и похожих) игр в текущей директории ---
        if (potentialGamesInCurrentDir.length > 0) {
          const gameGroups = new Map<string, GameInfo[]>();
  
          for (const game of potentialGamesInCurrentDir) {
            let baseName = game.name.replace(/\.(exe|py|sh|bat|cmd)$/i, '');
            baseName = baseName.replace(/-32$/i, ''); 
            
            if (!gameGroups.has(baseName)) {
              gameGroups.set(baseName, []);
            }
            gameGroups.get(baseName)!.push(game);
          }
  
          for (const [baseName, group] of gameGroups.entries()) {
            let bestGame: GameInfo | null = null;
            
            const exeVersions = group.filter(g => g.type === 'exe');
            const pyVersions = group.filter(g => g.type === 'py');
            const shVersions = group.filter(g => g.type === 'sh');
            const batCmdVersions = group.filter(g => g.type === 'bat' || g.type === 'cmd');
  
            const non32Exe = exeVersions.find(g => !g.name.toLowerCase().includes('-32.exe'));
            if (non32Exe) {
              bestGame = non32Exe;
            } else if (exeVersions.length > 0) {
              bestGame = exeVersions[0];
            } else if (shVersions.length > 0) {
              bestGame = shVersions[0];
            } else if (batCmdVersions.length > 0) {
              bestGame = batCmdVersions[0];
            } else if (pyVersions.length > 0) {
              bestGame = pyVersions[0];
            }
  
            if (bestGame) {
              if (!games.some(g => g.path === bestGame!.path)) {
                games.push(bestGame);
              }
            } else {
               if (group.length > 0 && !games.some(g => g.path === group[0]!.path)) {
                   games.push(group[0]);
               }
            }
          }
        }
  
      } catch (e) {
        console.error(`Ошибка при сканировании директории ${currentDir}:`, e);
        // Если произошла ошибка доступа к директории (например, из-за прав), просто пропускаем ее
      }
    }
  
    return games;
  }