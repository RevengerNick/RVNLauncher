import { useState, useEffect, useMemo } from 'react';
import { GameEntry, getAllGamesFromDb } from '../utils/db';
import { selectGameDirectory, scanForGames } from '../utils/game-scanner';
import { addGameToDb } from '../utils/db';
import GameCard from '../components/GameCard';

function Library() {
  const [games, setGames] = useState<GameEntry[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isFullScan, setIsFullScan] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    const loadGames = async () => {
      const gamesFromDb = await getAllGamesFromDb();
      setGames(gamesFromDb);
    };
    loadGames();
  }, []);

  const sortedGames = useMemo(() => {
    const _games = [...games].sort((a, b) => {
      if (a.rating !== b.rating) {
        return b.rating - a.rating; // Сначала по рейтингу (убывание)
      }
      return a.name.localeCompare(b.name); // Затем по имени
    });
    if (showHidden) {
      return _games;
    } else {
      return _games.filter(g => !g.is_hidden);
    }
  }, [games, showHidden]);

  const handleScanDirectory = async () => {
    const selectedDir = await selectGameDirectory();
    if (selectedDir) {
      setIsScanning(true);
      const scannedRaw = await scanForGames(selectedDir, isFullScan);
      
      for (const scannedGame of scannedRaw) {
        if (!games.some(g => g.path === scannedGame.path)) {
            const newGameEntry: GameEntry = {
              ...scannedGame,
              name: scannedGame.name.replace(/\.(exe|py|sh|bat|cmd)$/i, ''),
              play_time_seconds: 0,
              rating: 0,
              is_hidden: false,
            };
            await addGameToDb(newGameEntry);
        }
      }
      
      const updatedGames = await getAllGamesFromDb();
      setGames(updatedGames);
      setIsScanning(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Ваша Библиотека</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="form-checkbox h-5 w-5 text-blue-500 bg-gray-700 border-gray-600 rounded"
              checked={isFullScan} 
              onChange={(e) => setIsFullScan(e.target.checked)} 
            />
            <span>Полный поиск</span>
            <input 
              type="checkbox" 
              className="form-checkbox h-5 w-5 text-blue-500 bg-gray-700 border-gray-600 rounded"
              checked={showHidden} 
              onChange={(e) => setShowHidden(e.target.checked)} 
            />
            <span>Показать скрытые</span>
          </label>
          <button 
            onClick={handleScanDirectory} 
            disabled={isScanning}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500"
          >
            {isScanning ? 'Сканирование...' : 'Добавить папку'}
          </button>
        </div>
      </div>
      
      {games.length === 0 && !isScanning && (
        <p className="text-gray-400">Игры не найдены. Добавьте папку с играми, чтобы начать.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedGames.map(game => (
          <GameCard key={game.path} game={game} />
        ))}
      </div>
    </div>
  );
}

export default Library;