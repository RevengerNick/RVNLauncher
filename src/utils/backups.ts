import { appDataDir, BaseDirectory, join } from "@tauri-apps/api/path";
import { GameEntry } from "./db";
import { invoke } from "@tauri-apps/api/core";
import toast from 'react-hot-toast';
import { basename, dirname,} from "@tauri-apps/api/path";
import { exists } from "@tauri-apps/plugin-fs";
import { openPath } from "@tauri-apps/plugin-opener";

export const startBackup = async (game: GameEntry) => {
    if (game) {
      try {
        console.log(game.path)
        const result = await invoke<string>('backup_saves', { gamePath: game.path });
        toast.success(result);
      } catch (error: any) {
        toast.error(`Ошибка: ${error.toString()}`);
      }
    }   
  };

export const handleOpenBackupsFolder = async (game: GameEntry) => {
    try {
        // 1. Получаем имя родительской директории игры.
        // dirname('E:\\Games\\MyGame\\MyGame.exe') -> 'E:\\Games\\MyGame'
        const gameDir = await dirname(game.path);
        // basename('E:\\Games\\MyGame') -> 'MyGame'
        const gameFolderName = await basename(gameDir);

        if (!gameFolderName) {
            throw new Error("Не удалось определить имя папки игры.");
        }

        // 2. Формируем полный путь к папке с бэкапами этой игры.
        const appDataPath = await appDataDir();
        const backupsGamePath = await join(appDataPath, 'backups', gameFolderName);

        // 3. Проверяем, существует ли папка.
        // `exists` работает с абсолютными путями, но лучше использовать BaseDirectory для надежности.
        // Здесь мы проверим существование папки `backups/gameFolderName` внутри `AppData`.
        const backupsRelativePath = await join('backups', gameFolderName);
        const folderExists = await exists(backupsRelativePath, { baseDir: BaseDirectory.AppData });

        if (folderExists) {
            // 4. Открываем папку в проводнике.
            // `openPath` лучше подходит для открытия директорий.
            await openPath(backupsGamePath);
        } else {
            toast.error(`Папка с бэкапами для "${game.name}" еще не создана.`);
            // Можно предложить открыть общую папку backups, если она существует
            const backupsRootExists = await exists('backups', { baseDir: BaseDirectory.AppData });
            if (backupsRootExists) {
                const backupsRootPath = await join(appDataPath, 'backups');
                await openPath(backupsRootPath);    
            }
        }
    } catch (error) {
        console.error("Не удалось открыть папку с бэкапами:", error);
        toast.error(`Ошибка: ${error}`);
    }
};
  export async function deleteBackup(backupPath: string): Promise<void> {
    await invoke('delete_backup', { backupPath });
}

export async function restoreBackup(gamePath: string, backupPath: string, strategy: string): Promise<void> {
    await invoke('restore_backup', { gamePath, backupPath, strategy });
}