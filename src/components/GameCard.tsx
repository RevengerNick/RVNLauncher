import { Link } from 'react-router-dom';
import { GameEntry } from '../utils/db'; // Импортируем тип.
import { getIconUrl } from '../utils/icon-manager';
import { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { formatGameName } from '../utils/formatters';
interface GameCardProps {
  game: GameEntry;
}

function GameCard({ game }: GameCardProps) {
const [iconUrl, setIconUrl] = useState<string | undefined>(undefined);
  const encodedPath = encodeURIComponent(game.path);

     useEffect(() => {
        let cancelled = false;
        const loadIcon = async () => {
          if (game?.icon_path) {
            const url = await getIconUrl(game.icon_path);
            if (!cancelled) setIconUrl(url);
          } else {
            setIconUrl(undefined);
          }
        };
        loadIcon();
        return () => {
          cancelled = true;
        };
      }, [game?.icon_path]);
  
  return (
    <Link 
      to={`/game/${encodedPath}`} 
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-200 group"
    >
      <div className="h-40 bg-gray-700 flex items-center justify-center relative">
        {game.icon_path ? (
          <img 
            src={iconUrl} 
            alt={game.name} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <span className="text-gray-500">Нет иконки</span>
        )}
      </div>
      <div className="space-y-1 p-2">
        <h3 className="font-bold text-lg text-center group-hover:text-blue-400" title={game.name}>
          {formatGameName(game.name)}   
        </h3>
      
      <div className="text-center">Версия: {game.version}</div>
      <div className="items-center justify-center flex w-full">
            <StarRating 
              rating={game.rating}
            />  
          </div>
      </div>
    </Link>
  );
}

export default GameCard;