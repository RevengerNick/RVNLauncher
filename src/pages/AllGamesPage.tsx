import { useState, useEffect, useMemo } from 'react';
import { useGames } from '../hooks/useGames';
import { getIconUrl } from '../utils/icon-manager';
import { appDataDir, join } from '@tauri-apps/api/path';
import { RecentGameCard } from '../components/RecentGameCard';
import { PosterGameCard } from '../components/PosterGameCard';
import { MagnifyingGlassIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

function AllGamesPage() {
  const { games, loading } = useGames({ sortBy: 'playtime', showHidden: false }); // Сортируем по дате последнего запуска
  const [iconUrls, setIconUrls] = useState<Map<string, string | null>>(new Map());

  // Асинхронная загрузка всех иконок
  useEffect(() => {
    const loadAllIcons = async () => {
      const appData = await appDataDir();
      const urls = new Map<string, string | null>();
      for (const game of games) {
        if (game.icon_path) {
          const fullIconPath = await join(appData, game.icon_path);
          const url = await getIconUrl(fullIconPath);
          urls.set(game.path, url);
        }
      }
      setIconUrls(urls);
    };

    if (games.length > 0) {
      loadAllIcons();
    }
  }, [games]);

  const recentGames = useMemo(() => {
    // Берем 3 последние игры, у которых есть дата последнего запуска
    return games.filter(g => g.last_played).slice(0, 3);
  }, [games]);

  return (
    <div className="bg-primary text-text-primary p-8">
      {/* Шапка */}
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Библиотека</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Поиск игр..."
              className="bg-secondary pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button className="p-2 rounded-full hover:bg-secondary">
            <BellIcon className="w-6 h-6 text-text-secondary" />
          </button>
          <button className="p-1 rounded-full hover:bg-secondary">
            <UserCircleIcon className="w-8 h-8 text-text-secondary" />
          </button>
        </div>
      </header>
      
      {/* Недавно играли */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Недавно играли</h2>
        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {recentGames.map(game => (
              <RecentGameCard key={game.path} game={game} iconDataUrl={iconUrls.get(game.path) || null} />
            ))}
          </div>
        )}
      </section>

      {/* Все игры */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Все игры</h2>
        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {games.map(game => (
              <PosterGameCard key={game.path} game={game} iconDataUrl={iconUrls.get(game.path) || null} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AllGamesPage;