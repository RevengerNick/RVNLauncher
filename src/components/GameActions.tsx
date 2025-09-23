import GameFolderManager from "./GameFolderManager";
import { useGameSession } from '../context/GameSessionContext';
import { callLaunchGameCommand } from '../utils/start-game'; // Добавил импорт

interface GameActionsProps {
  gamePath: string;
  initialFolderIds: number[];
  onFoldersChange: (ids: number[]) => void;
  onOpenFolder: () => void;
}

export function GameActions({ gamePath, initialFolderIds, onFoldersChange, onOpenFolder }: GameActionsProps) {
  const { addSession, removeSession, isGameRunning } = useGameSession();
  const isRunning = isGameRunning(gamePath);

  return (
    <div className="flex items-center gap-4 mb-8">
      <button 
        onClick={() => callLaunchGameCommand(gamePath, addSession, removeSession)}
        disabled={isRunning}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded text-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {isRunning ? 'Запущена' : 'Играть'}
      </button>

      <GameFolderManager 
        gamePath={gamePath}
        initialFolderIds={initialFolderIds}
        onFoldersChange={onFoldersChange}
      />
      
      <button onClick={onOpenFolder} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded text-lg">
        Открыть папку
      </button>
    </div>
  );
}