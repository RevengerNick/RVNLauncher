import GameCard from './GameCard';
import { GameEntry } from '../utils/db';

interface GameGridProps {
  games: GameEntry[];
  loading: boolean;
}

function GameGrid({ games, loading }: GameGridProps) {
  if (loading) {
    return <p className="text-gray-400">Загрузка игр...</p>;
  }

  if (games.length === 0) {
    return <p className="text-gray-400">Игры не найдены.</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {games.map(game => (
        <GameCard key={game.path} game={game} />
      ))}
    </div>
  );
}

export default GameGrid;