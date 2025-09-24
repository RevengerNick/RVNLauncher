import { useState } from 'react';
import { useGames } from '../hooks/useGames';
import GameGrid from '../components/GameGrid';
import LibraryHeader from '../components/LibraryHeader';

function AllGamesPage() {
  const [showHidden, setShowHidden] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'playtime'>('rating');
  const { games, loading, refreshGames } = useGames({ 
    showHidden, 
    sortBy 
  });

  const filteredGames = games.filter(game => 
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <LibraryHeader title="Ваша Библиотека" onScanComplete={refreshGames} />
      
      {/* Здесь можно добавить фильтры и сортировку, которые будут управлять состоянием */}
      <div className="mb-4">

        <input
                type="text"
                placeholder="Поиск по названию..."
                className="bg-gray-800 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 mr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

<select
              className="bg-gray-800 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'name' | 'playtime')}
          >
              <option value="rating">По рейтингу</option>
              <option value="name">По названию</option>
              <option value="playtime">По времени игры</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer ml-4">
              <input 
                  type="checkbox" 
                  className="form-checkbox h-5 w-5 text-blue-500 bg-gray-700 border-gray-600 rounded"
                  checked={showHidden} 
                  onChange={(e) => setShowHidden(e.target.checked)} 
              />
              <span>Показать скрытые</span>
          </label>
      </div>

      <GameGrid games={filteredGames} loading={loading} />
    </div>
  );
}

export default AllGamesPage;