import { Link } from 'react-router-dom';
import { GameEntry } from '../utils/db';
import { formatGameName } from '../utils/formatters';
// ...

interface PosterGameCardProps {
  game: GameEntry;
  iconDataUrl: string | null;
}

export function PosterGameCard({ game, iconDataUrl }: PosterGameCardProps) {
    const encodedPath = encodeURIComponent(game.path);

    return (
        <Link to={`/game/${encodedPath}`} className="block relative aspect-[2/3] bg-secondary rounded-2xl overflow-hidden shadow-md group">
            {iconDataUrl ? (
                <img src={iconDataUrl} alt={game.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-text-secondary">Нет постера</div>
            )}
            {/* Градиент и название */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <h3 className="absolute bottom-4 left-4 right-4 font-bold text-white text-lg truncate">
                {formatGameName(game.name)}
            </h3>
        </Link>
    );
}