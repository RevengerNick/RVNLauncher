import { useState } from 'react';
import { GameEntry } from "../utils/db";
import { handleOpenBackupsFolder, startBackup } from '../utils/backups'; // Предполагаю, что эти утилиты существуют

interface GameSavesManagerProps {
  game: GameEntry;
}

export function GameSavesManager({ game }: GameSavesManagerProps) {
  const [backupStatus, setBackupStatus] = useState('');

  const handleBackup = async () => {
    if (game) {
      await startBackup(game, setBackupStatus);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-2">Сохранения</h2>
      <div className="flex items-center gap-4">
        <button 
          onClick={handleBackup} 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded text-lg"
        >
          Сделать бэкап
        </button>
        <button 
          onClick={() => handleOpenBackupsFolder(setBackupStatus)} 
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded text-lg"
        >
          Показать бэкапы
        </button>
      </div>
      {backupStatus && <p className="text-sm text-gray-400 mt-2">{backupStatus}</p>}
    </div>
  );
}