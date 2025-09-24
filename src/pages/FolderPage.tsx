import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGames } from '../hooks/useGames';
import GameGrid from '../components/GameGrid';
import LibraryHeader from '../components/LibraryHeader';
import { useFolders } from '../hooks/useFolders';

function FolderPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const [showHidden, setShowHidden] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'playtime'>('rating');
  
  // Получаем игры для конкретной папки
  const { games, loading, refreshGames } = useGames({ 
    folderId: folderId ? parseInt(folderId, 10) : undefined, 
    showHidden 
  });

  const filteredGames = games.filter(game => 
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Получаем имя папки для заголовка
  const { folders } = useFolders();
  const currentFolder = folders.find(f => f.id === parseInt(folderId || '0', 10));

  return (
    <div>
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
      <LibraryHeader title={currentFolder?.name || 'Папка'} onScanComplete={refreshGames} />
      
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

      <GameGrid games={filteredGames} loading={loading} />
    </div>
  );
}

export default FolderPage;