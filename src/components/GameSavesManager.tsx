import { useEffect, useState } from 'react';
import { GameEntry } from "../utils/db";
import { handleOpenBackupsFolder, startBackup } from '../utils/backups'; // Предполагаю, что эти утилиты существуют
import { invoke } from '@tauri-apps/api/core';
import { deleteBackup, restoreBackup } from '../utils/backups';
import { useConfirm } from '../context/ConfirmContext';
import toast from 'react-hot-toast';
import { RestoreStrategy, RestoreStrategyModal } from './RestoreStrategyModal';
interface BackupInfo {
    file_name: string;
    path: string;
    created_at: string;
  }
  
interface GameSavesManagerProps {
  game: GameEntry;
}

export function GameSavesManager({ game }: GameSavesManagerProps) {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const confirm = useConfirm();
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedBackupPath, setSelectedBackupPath] = useState('');
  const handleBackup = async () => {
    if (game) {
      await startBackup(game);
      await fetchBackups(); 
    }
  };

  const handleDelete = async (backupPath: string) => {
    const isConfirmed = await confirm({
        title: 'Удалить бэкап?',
        description: 'Это действие необратимо. Вы уверены, что хотите удалить этот файл бэкапа?',
        confirmText: 'Да, удалить',
        kind: 'danger'
    });

    if (isConfirmed) {
      try {
        await deleteBackup(backupPath);
        toast.success(`Бэкап удален.`);
        await fetchBackups();
      } catch (error: any) {
        toast.error(`Ошибка удаления: ${error.toString()}`);
      }
    }
  };

  const fetchBackups = async () => {
    if (game) {
      try {
        const backupList = await invoke<BackupInfo[]>('list_backups', { gamePath: game.path });
        setBackups(backupList);
      } catch (error) {
        console.error("Не удалось загрузить список бэкапов:", error);
      }
    }
  };

  useEffect(() => {
    fetchBackups();
  }, [game]);
  
  const handleRestoreClick = (backupPath: string) => {
    setSelectedBackupPath(backupPath);
    setIsRestoreModalOpen(true);
  };
  
  const handleSelectRestoreStrategy = async (strategy: RestoreStrategy) => {
    setIsRestoreModalOpen(false);

    if (strategy === 'delete') {
      const isConfirmed = await confirm({
        title: "Вы уверены?",
        description: "Текущие сохранения будут удалены навсегда. Это действие нельзя отменить.",
        confirmText: "Да, удалить",
        kind: 'danger'
      });
      if (!isConfirmed) return;
    }
    
    try {
      await restoreBackup(game.path, selectedBackupPath, strategy);
      toast.success('Сохранения восстановлены!');
    } catch (error: any) {
      toast.error(`Ошибка восстановления: ${error.toString()}`);
    }
  };
  return (
    <div className="mt-8">
        <RestoreStrategyModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onSelectStrategy={handleSelectRestoreStrategy}
      />
      <h2 className="text-2xl font-bold mb-2 text-text-primary">Сохранения</h2>
      <div className="flex items-center gap-4">
        <button 
          onClick={handleBackup} 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded text-lg"
        >
          Сделать бэкап
        </button>
        <button 
          onClick={() => handleOpenBackupsFolder(game)} 
          className="bg-primary hover:bg-tertiary text-text-primary font-bold py-3 px-6 rounded text-lg"
        >
          Открыть папку бэкапов
        </button>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2 text-text-primary">Доступные бэкапы:</h3>
        {backups.length > 0 ? (
          <ul className="space-y-2">
            {backups.map(backup => (
              <li key={backup.path} className="bg-secondary p-3 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-semibold text-text-primary">{backup.file_name}</p>
                  <p className="text-xs text-text-primary">Создан: {new Date(backup.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                <button 
                    onClick={() => handleRestoreClick(backup.path)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                    Восстановить
                </button>
                  <button 
                    onClick={() => handleDelete(backup.path)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-primary">Бэкапы для этой игры еще не созданы.</p>
        )}
      </div>
    </div>
  );
}