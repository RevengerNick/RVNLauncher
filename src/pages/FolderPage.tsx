import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGames } from '../hooks/useGames';
import GameGrid from '../components/GameGrid';
import LibraryHeader from '../components/LibraryHeader';
import { useFolders } from '../hooks/useFolders';

function FolderPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const [showHidden, setShowHidden] = useState(false);
  
  // Получаем игры для конкретной папки
  const { games, loading, refreshGames } = useGames({ 
    folderId: folderId ? parseInt(folderId, 10) : undefined, 
    showHidden 
  });
  
  // Получаем имя папки для заголовка
  const { folders } = useFolders();
  const currentFolder = folders.find(f => f.id === parseInt(folderId || '0', 10));

  return (
    <div>
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

      <GameGrid games={games} loading={loading} />
    </div>
  );
}

export default FolderPage;