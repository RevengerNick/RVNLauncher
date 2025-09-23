import { appDataDir, join } from "@tauri-apps/api/path";
import { GameEntry } from "./db";
import { invoke } from "@tauri-apps/api/core";
import { revealItemInDir } from "@tauri-apps/plugin-opener";

export const startBackup = async (game: GameEntry, setBackupStatus: (status: string) => void) => {
    if (game) {
      setBackupStatus('Создание бэкапа...');
      try {
        console.log(game.path)
        const result = await invoke<string>('backup_saves', { gamePath: game.path });
        setBackupStatus(result);
      } catch (error: any) {
        setBackupStatus(`Ошибка: ${error.toString()}`);
      }
    }   
  };

export const handleOpenBackupsFolder = async (setBackupStatus: (status: string) => void) => {
    try {
      const appDataPath = await appDataDir();
      const backupsPath = await join(appDataPath, 'backups');
      await revealItemInDir(backupsPath);
    } catch (error) {
      console.error("Не удалось открыть папку с бэкапами:", error);
      setBackupStatus(`Ошибка: Не удалось открыть папку. ${error}`);
    }
  };