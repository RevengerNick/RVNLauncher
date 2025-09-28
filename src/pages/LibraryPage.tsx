import { useState, useMemo } from 'react';
import { useGames } from '../hooks/useGames';
import { RecentGameCard } from '../components/RecentGameCard';
import { PosterGameCard } from '../components/PosterGameCard';
import { MagnifyingGlassIcon, BellIcon, UserCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router-dom';
import { useFolders } from '../hooks/useFolders';

function LibraryPage() {
  const { folderId } = useParams<{ folderId?: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] =useState<'all' | 'favorites'>('all'); // Убрал 'installed' для простоты
  const [showHidden, setShowHidden] = useState(false);
  
  // Получаем все игры, сортируем по дате последнего запуска
  const { games, loading } = useGames({ 
    folderId: folderId ? parseInt(folderId, 10) : undefined,
    sortBy: 'completion_percent',
    showHidden: showHidden 
  });
  const { folders } = useFolders();
  const currentFolder = useMemo(() => {
    return folderId ? folders.find(f => f.id === parseInt(folderId, 10)) : null;
  }, [folders, folderId, showHidden]);

  const processedGames = useMemo(() => {
    return games
      .filter(game => {
        const nameMatch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
        const favoriteMatch = filter === 'favorites' ? game.rating === 5 : true;
        return nameMatch && favoriteMatch;
      })
      // Сортировку теперь можно делать здесь, если нужно
      // .sort(...) 
  }, [games, searchTerm, filter, showHidden]);
  
  const recentGames = useMemo(() => {
    return processedGames.filter(g => g.last_played).slice(0, 3);
  }, [processedGames, games]);

  const TabButton = ({ value, label }: { value: typeof filter, label: string }) => (
    <button 
      onClick={() => setFilter(value)}
      className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === value ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
    >
      {label}
    </button>
  );

  // Определяем заголовок страницы
  const pageTitle = currentFolder ? currentFolder.name : "Библиотека";


  return (
    <div className="bg-gray-900 text-white p-6">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">{pageTitle}</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Поиск игр..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="p-2 rounded-full hover:bg-gray-800"><BellIcon className="w-6 h-6" /></button>
          <button className="p-1 rounded-full hover:bg-gray-800"><UserCircleIcon className="w-8 h-8" /></button>
        </div>
      </header>
      
      {recentGames.length > 0 && <section>
        <h2 className="text-2xl font-semibold mb-4">Недавно играли</h2>
        {loading ? <p>Загрузка...</p> : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {recentGames.map(game => (
              <RecentGameCard key={game.path} game={game} iconDataUrl={game.icon_url} />
            ))}
          </div>
        )}
      </section>}

      <section className="mt-12">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Все игры</h2>
            <div className="flex items-center bg-gray-800 rounded-md p-1 space-x-1">
                <TabButton value="all" label="Все" />
                <TabButton value="favorites" label="Избранное" />
            </div>
            <button onClick={() => setShowHidden(!showHidden)} className="p-2 rounded-full hover:bg-gray-800">
                {showHidden ? <EyeIcon className="w-6 h-6" /> : <EyeSlashIcon className="w-6 h-6" />}
            </button>
        </div>
        {loading ? <p>Загрузка...</p> : (
          <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {processedGames.map(game => (
              <PosterGameCard key={game.path} game={game} iconUrl={game.icon_url} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default LibraryPage;