import { GameEntry } from "../utils/db";
import { formatGameName, formatPlaytime } from "../utils/formatters";
import StarRating from "./StarRating";
import { useDebouncedCallback } from "use-debounce";
import { TrashIcon, EyeIcon, EyeSlashIcon, PhotoIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import GameFolderManager from "./GameFolderManager";
import { useGameSession } from '../context/GameSessionContext'; // Нужен для кнопки "Играть"
import { callLaunchGameCommand } from '../utils/start-game'; // Нужен для кнопки "Играть"

interface GameHeaderProps {
  game: GameEntry;
  iconDataUrl: string | null;
  gameFolderIds: number[];
  setGameFolderIds: (ids: number[]) => void;
  onIconChange: () => void;
  onPasteIcon: () => void;
  onRatingChange: (rating: number) => void;
  onNameChange: (name: string) => void;
  onToggleHidden: () => void;
  onOpenFolder: () => void;
  onDeleteGame?: (gamePath: string) => void;
}

export function GameHeader({ 
  game, 
  iconDataUrl, 
  gameFolderIds,
  setGameFolderIds,
  onIconChange,
  onPasteIcon, 
  onRatingChange, 
  onNameChange, 
  onToggleHidden,
  onOpenFolder, 
  onDeleteGame 
}: GameHeaderProps) {
  
  const debouncedSaveName = useDebouncedCallback(onNameChange, 1000);
  const { addSession, removeSession, isGameRunning } = useGameSession();
  const isRunning = isGameRunning(game.path);

  return (
    // --- ГЛАВНЫЙ АДАПТИВНЫЙ FLEX-КОНТЕЙНЕР ---
    <div className="flex flex-wrap items-start gap-6 mb-8">
      
      {/* --- БЛОК С ИКОНКОЙ (не меняется) --- */}
      <div className="w-40 h-56 bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden group relative">
        {/* ... (код иконки и кнопок "Сменить"/"Вставить") ... */}
        {iconDataUrl ? ( 
          <img src={iconDataUrl} alt={game.name} className="w-full h-full object-cover" /> 
        ) : ( 
          <span className="text-gray-500 text-center">Нет<br/>иконки</span> 
        )}
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity space-y-2 p-2">
            <button onClick={onIconChange} className="flex items-center justify-center gap-1 w-full p-2 bg-blue-600 hover:bg-blue-700 rounded text-xs" title="Выбрать файл иконки">
                <PhotoIcon className="w-4 h-4" /> Выбрать
            </button>
            <button onClick={onPasteIcon} className="flex items-center justify-center gap-1 w-full p-2 bg-purple-600 hover:bg-purple-700 rounded text-xs" title="Вставить из буфера обмена">
                <ClipboardDocumentIcon className="w-4 h-4" /> Вставить
            </button>
        </div>
      </div>

      {/* --- БЛОК С ИНФОРМАЦИЕЙ И КНОПКАМИ ДЕЙСТВИЙ (гибкий) --- */}
      <div className="flex-1 flex flex-col min-w-[300px]"> {/* flex-1 и min-width для правильного переноса */}
        
        {/* --- Верхняя часть: Название и метаданные --- */}
        <div className="flex-1">
          <input 
            type="text" 
            defaultValue={formatGameName(game.name)}
            className="w-full text-5xl font-bold bg-transparent focus:bg-gray-800 rounded px-2 -mx-2 outline-none focus:ring-2 focus:ring-blue-500" 
            onChange={(e) => debouncedSaveName(e.target.value)} 
          />
          <p className="text-gray-400 my-2">Сыграно: {formatPlaytime(game.play_time_seconds)}</p>
          <p className="text-gray-500 text-sm">Последний запуск: {game.last_played ? new Date(game.last_played).toLocaleString() : 'Никогда'}</p>
          <div className="my-4">
            <StarRating rating={game.rating} onRatingChange={onRatingChange} starSize="medium" />
          </div>
        </div>

        {/* --- Нижняя часть: Основные кнопки действий --- */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <button 
            onClick={() => callLaunchGameCommand(game.path, addSession, removeSession)}
            disabled={isRunning}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded text-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Запущена' : 'Играть'}
          </button>
          
          <GameFolderManager 
            gamePath={game.path}
            initialFolderIds={gameFolderIds}
            onFoldersChange={setGameFolderIds}
          />

          <button onClick={onOpenFolder} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
            Открыть папку
          </button>

          <button onClick={onToggleHidden} className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm" >
            {game.is_hidden ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
            {game.is_hidden ? 'Показать' : 'Скрыть'}
          </button>
          
          {onDeleteGame && (
            <button onClick={() => onDeleteGame(game.path)} className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm" >
              <TrashIcon className="w-5 h-5" /> Удалить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}