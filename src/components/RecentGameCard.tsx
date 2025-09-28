import { Link } from 'react-router-dom';
import { GameEntry } from '../utils/db';
import { formatGameName, formatPlaytime } from '../utils/formatters';
// ... (другие импорты, если нужны)

interface RecentGameCardProps {
  game: GameEntry;
  // iconDataUrl будет получен в родительском компоненте
  iconDataUrl: string | null; 
}

export function RecentGameCard({ game, iconDataUrl }: RecentGameCardProps) {
  const encodedPath = encodeURIComponent(game.path);
  const progress = game.completion_percent || 0;

  return (
    <Link 
      to={`/game/${encodedPath}`} 
      className="block bg-secondary rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      {/* Фоновое изображение (баннер) */}
      <div className="h-32 bg-gray-700 relative">
        {iconDataUrl && (
          <img src={iconDataUrl} alt={game.name} className="w-full h-full object-cover opacity-60" />
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-xl text-text-primary truncate" title={formatGameName(game.name)}>
          {formatGameName(game.name)}
        </h3>
        <p className="text-sm text-text-secondary mt-1">
          Сыграно: {formatPlaytime(game.play_time_seconds)}
        </p>

        {/* Прогресс-бар */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
          <div 
            className="bg-accent h-2 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </Link>
  );
}