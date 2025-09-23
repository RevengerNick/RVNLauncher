import { useState } from 'react';
import { useGames } from '../hooks/useGames';
import GameGrid from '../components/GameGrid';
import LibraryHeader from '../components/LibraryHeader';

function AllGamesPage() {
  const [showHidden, setShowHidden] = useState(false);
  // Используем наш хук для получения всех игр
  const { games, loading, refreshGames } = useGames({ showHidden });

  return (
    <div>
      <LibraryHeader title="Ваша Библиотека" onScanComplete={refreshGames} />
      
      {/* Здесь можно добавить фильтры и сортировку, которые будут управлять состоянием */}
      <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
              <input 
                  type="checkbox" 
                  className="form-checkbox h-5 w-5 text-blue-500 bg-gray-700 border-gray-600 rounded"
                  checked={showHidden} 
                  onChange={(e) => setShowHidden(e.target.checked)} 
              />
              <span>Показать скрытые</span>
          </label>
      </div>

      <GameGrid games={games} loading={loading} />
    </div>
  );
}

export default AllGamesPage;