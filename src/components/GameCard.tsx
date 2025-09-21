import { Link } from 'react-router-dom';
import { GameEntry } from '../utils/db'; // Импортируем тип

interface GameCardProps {
  game: GameEntry;
}

function GameCard({ game }: GameCardProps) {
  // Кодируем путь, чтобы его можно было безопасно использовать в URL
  const encodedPath = encodeURIComponent(game.path);

  return (
    <Link 
      to={`/game/${encodedPath}`} 
      className="block bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-200"
    >
      {/* Прямоугольник-заглушка для иконки */}
      <div className="h-40 bg-gray-700 flex items-center justify-center">
        <span className="text-gray-500">Нет иконки</span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg truncate" title={game.name}>
          {game.name}
        </h3>
      </div>
    </Link>
  );
}

export default GameCard;