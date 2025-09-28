import { GameEntry } from "../../utils/db";
import { formatGameName, formatPlaytime } from "../../utils/formatters";
import { useDebouncedCallback } from "use-debounce";
import StarRating from "../StarRating";
import { generateGradientColors } from "../../utils/gradient-generator";
import { ImageOrientation } from "../../utils/image";
import { ActionMenu } from "../ActionMenu"; // Импортируем наше новое меню

interface GamePageHeaderProps {
  game: GameEntry;
  iconDataUrl: string | null;
  iconOrientation: ImageOrientation;
  onIconChange: () => void;
  onPasteIcon: () => void;
  onRatingChange: (rating: number) => void;
  onNameChange: (name: string) => void;
  // Добавим функцию удаления иконки
  onDeleteIcon: () => void;
}

export function GamePageHeader({ game, iconDataUrl, iconOrientation, onIconChange, onPasteIcon, onRatingChange, onNameChange, onDeleteIcon }: GamePageHeaderProps) {
  const debouncedSaveName = useDebouncedCallback(onNameChange, 1000);
  
  const { color1, color2 } = generateGradientColors(game.name);
  const gradientStyle = {
    backgroundImage: `linear-gradient(to top right, ${color1}, ${color2})`,
  };

  // --- Рендеринг для ГОРИЗОНТАЛЬНОГО изображения (баннера) ---
  if (iconDataUrl && iconOrientation === 'landscape') {
    return (
      <div className="w-full">
        <h1 className="text-white tracking-light text-4xl font-bold p-4 text-center md:text-left">
          {formatGameName(game.name)}
        </h1>
        <div className="w-full aspect-[16/9] rounded-lg overflow-hidden group relative shadow-2xl">
          <img src={iconDataUrl} alt={game.name} className="w-full h-full object-cover" />
          
          {/* --- МЕНЮ "ТРИ ТОЧКИ" СПРАВА СВЕРХУ --- */}
          <div className="absolute top-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity">
            <ActionMenu 
                onIconChange={onIconChange}
                onPasteIcon={onPasteIcon}
                onDeleteIcon={onDeleteIcon}
            />
          </div>
        </div>
        {/* Метаданные под баннером */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 px-4">
            <p className="text-gray-400">Сыграно: {formatPlaytime(game.play_time_seconds)}</p>
            <div className="flex items-center gap-2">
                <span className="text-gray-400">Рейтинг:</span>
                <StarRating rating={game.rating} onRatingChange={onRatingChange} starSize="small" />
            </div>
        </div>
      </div>
    );
  }

  // --- Рендеринг для ВЕРТИКАЛЬНОГО, КВАДРАТНОГО или ОТСУТСТВУЮЩЕГО изображения ---
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
      {/* Блок для иконки (постер) */}
      <div className="w-64 h-96 bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden group relative shadow-2xl" style={!iconDataUrl ? gradientStyle : {}}>
        {iconDataUrl ? ( 
          <img src={iconDataUrl} alt={game.name} className="w-full h-full object-cover" /> 
        ) : ( 
          <span className="text-white text-2xl font-bold p-4 text-center opacity-70">{formatGameName(game.name)}</span> 
        )}
        
        {/* --- МЕНЮ "ТРИ ТОЧКИ" СПРАВА СВЕРХУ --- */}
        <div className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
            <ActionMenu 
                onIconChange={onIconChange}
                onPasteIcon={onPasteIcon}
                onDeleteIcon={iconDataUrl ? onDeleteIcon : undefined} // Показываем кнопку "Удалить", только если иконка есть
            />
        </div>
      </div>

      {/* Блок с метаданными */}
      <div className="flex-1 text-center md:text-left">
        <input 
          type="text" 
          defaultValue={formatGameName(game.name)}
          className="w-full text-5xl font-bold bg-transparent focus:bg-gray-800 rounded px-2 -mx-2 outline-none focus:ring-2 focus:ring-blue-500" 
          onChange={(e) => debouncedSaveName(e.target.value)} 
        />
        <p className="text-gray-400 my-2">Сыграно: {formatPlaytime(game.play_time_seconds)}</p>
        <p className="text-gray-500 text-sm">Последний запуск: {game.last_played ? new Date(game.last_played).toLocaleString() : 'Никогда'}</p>
        <div className="my-4 flex justify-center md:justify-start">
          <StarRating rating={game.rating} onRatingChange={onRatingChange} starSize="medium" />
        </div>
      </div>
    </div>
  );
}