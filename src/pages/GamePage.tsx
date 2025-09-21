import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { GameEntry, getAllGamesFromDb } from '../utils/db';
import { callLaunchGameCommand } from '../utils/start-game';

function GamePage() {
  const { gamePath } = useParams<{ gamePath: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameEntry | null>(null);

  // Декодируем путь из URL
  const decodedPath = gamePath ? decodeURIComponent(gamePath) : '';

  useEffect(() => {
    if (!decodedPath) return;
    
    const findGame = async () => {
      const allGames = await getAllGamesFromDb();
      const foundGame = allGames.find(g => g.path === decodedPath);
      if (foundGame) {
        setGame(foundGame);
      } else {
        // Если игра не найдена, можно перенаправить на главную
        navigate('/');
      }
    };
    findGame();
  }, [decodedPath, navigate]);

  if (!game) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-6 mb-8">
        {/* Прямоугольник-заглушка для иконки */}
        <div className="w-40 h-56 bg-gray-700 rounded-lg flex-shrink-0"></div>
        <div>
          <h1 className="text-5xl font-bold">{game.name}</h1>
          <p className="text-gray-400">Сыграно: {Math.round(game.play_time_seconds / 60)} минут</p>
        </div>
      </div>
      
      <button 
        onClick={() => callLaunchGameCommand(game.path)}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded text-lg mb-8"
      >
        Играть
      </button>

      <div>
        <h2 className="text-2xl font-bold mb-2">Описание</h2>
        <textarea 
          className="w-full bg-gray-800 p-2 rounded border border-gray-700"
          rows={5}
          defaultValue={game.description || ''}
          placeholder="Добавьте ваше описание..."
          // TODO: Добавить логику сохранения описания по db_update_game_description
        ></textarea>
      </div>
    </div>
  );
}

export default GamePage;