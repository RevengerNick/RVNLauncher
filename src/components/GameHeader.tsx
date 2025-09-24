import { GameEntry } from "../utils/db";
import { formatGameName, formatPlaytime } from "../utils/formatters";
import StarRating from "./StarRating";
import { useDebouncedCallback } from "use-debounce";
import { TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'; // Для иконки скрытия/удаления

interface GameHeaderProps {
  game: GameEntry;
  iconDataUrl: string | null;
  onIconChange: () => void;
  onRatingChange: (rating: number) => void;
  onNameChange: (name: string) => void;
  onToggleHidden: () => void;
  onDeleteGame?: (gamePath: string) => void; 
}

export function GameHeader({ game, iconDataUrl, onIconChange, onRatingChange, onNameChange, onToggleHidden, onDeleteGame }: GameHeaderProps) {
  const debouncedSaveName = useDebouncedCallback(onNameChange, 1000);
  
  return (
    <div className="flex items-start gap-6 mb-8"> 
      <div className="w-90 h-56 bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden group relative">
        {iconDataUrl ? ( 
          <img src={iconDataUrl} alt={game.name} className="w-full h-full object-cover" /> 
        ) : ( 
          <span className="text-gray-500 text-center">Нет<br/>иконки</span> 
        )}
        <button onClick={onIconChange} className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          Сменить
        </button>
      </div>

      <div className="flex-1"> 
        <input 
          type="text" 
          defaultValue={formatGameName(game.name)} 
          className="text-5xl font-bold bg-transparent focus:bg-gray-800 rounded px-2 -mx-2 outline-none focus:ring-2 focus:ring-blue-500" 
          onChange={(e) => debouncedSaveName(e.target.value)} 
        />
        <p className="text-gray-400 my-2">Сыграно: {formatPlaytime(game.play_time_seconds)}</p>
        <p className="text-gray-500 text-sm mt-1">
            Последний запуск: {game.last_played ? new Date(game.last_played).toLocaleString() : 'Никогда'}
        </p>
        <div className="mt-4">
          <StarRating rating={game.rating} onRatingChange={onRatingChange} starSize="medium" />
        </div>
        
        {/* Кнопки скрытия/удаления */}
        <div className="mt-4 flex gap-2">
            <button 
                onClick={onToggleHidden}
                className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-sm"
            >
                {game.is_hidden ? (
                  <>
                    <EyeIcon className="w-5 h-5" /> Показать
                  </>
                ) : (
                  <>
                    <EyeSlashIcon className="w-5 h-5" /> Скрыть
                  </>
                )}
            </button>
            {onDeleteGame && (
                <button 
                    onClick={() => onDeleteGame(game.path)}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                    <TrashIcon className="w-5 h-5" /> Удалить
                </button>
            )}
        </div>
      </div>
    </div>
  );
}