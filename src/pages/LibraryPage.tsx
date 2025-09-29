import { useState, useMemo, useEffect } from 'react';
import { useGames } from '../hooks/useGames';
import { RecentGameCard } from '../components/RecentGameCard';
import { PosterGameCard } from '../components/PosterGameCard';
import { MagnifyingGlassIcon, BellIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router-dom';
import { useFolders } from '../hooks/useFolders';
import { addGameToDb, GameEntry, getSetting } from '../utils/db';
import { scanForGames, selectGameDirectory } from '../utils/game-scanner';
import { ScanButtonWithOption } from '../components/buttons/ScanWithOption';
import { ProfileMenu } from '../components/ProfileMenu';

function LibraryPage() {
  const { folderId } = useParams<{ folderId?: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] =useState<'all' | 'favorites'>('all'); // Убрал 'installed' для простоты
  const [showHidden, setShowHidden] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [isFullScan, setIsFullScan] = useState(false);

    const handleScanDirectory = async () => {
        const selectedDir = await selectGameDirectory();
        if (selectedDir) {
            setIsScanning(true);
            const scannedRaw = await scanForGames(selectedDir, isFullScan);
            
            for (const scannedGame of scannedRaw) {
                const newGameEntry: GameEntry = {
                    name: scannedGame.name.replace(/\.(exe|py|sh|bat|cmd)$/i, ''),
                    path: scannedGame.path,
                    game_type: scannedGame.game_type,
                    play_time_seconds: 0,
                    rating: 0,
                    is_hidden: false,
                    version: scannedGame.version,
                    completion_percent: 0,
                    description: '',
                    icon_path: '',
                    last_played: '',
                    icon_url: ''
                };
                await addGameToDb(newGameEntry);
            }
            setIsScanning(false);
        }
    };
    

    const [gridConfig, setGridConfig] = useState({ small: 4, large: 6, ratio: '2/3' });
    const gridRecentStyle = {
      '--cols': (gridConfig.small/2).toString(),
      '--cols-lg': (gridConfig.large/2).toString(),
  } as React.CSSProperties;
    const gridStyle = {
      '--cols': gridConfig.small,
      '--cols-lg': gridConfig.large,
  } as React.CSSProperties;

  useEffect(() => {
    const loadGridSettings = async () => {
      const small = await getSetting('gridSmall');
      const large = await getSetting('gridLarge');
      const ratio = await getSetting('posterRatio');
      
      setGridConfig({
        small: parseInt(small || '4', 10),
        large: parseInt(large || '6', 10),
        ratio: ratio || '2/3'
      });
    };
    loadGridSettings();
  }, []);
  
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
  }, [games, searchTerm, filter, showHidden]);
  
  const recentGames = useMemo(() => {
    return processedGames.filter(g => g.last_played).slice(0, 3);
  }, [processedGames, games]);

  const TabButton = ({ value, label }: { value: typeof filter, label: string }) => (
    <button 
      onClick={() => setFilter(value)}
      className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === value ? 'bg-blue-500 text-text-primary' : 'text-text-secondary hover:bg-primary'}`}
    >
      {label}
    </button>
  );

  const pageTitle = currentFolder ? currentFolder.name : "Библиотека";
  
  return (
    <div className="bg-primary text-text-primary p-6">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">{pageTitle}</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Поиск игр..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-primary pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ScanButtonWithOption 
                onScan={handleScanDirectory} 
                isScanning={isScanning}
                isFullScan={isFullScan}
                setIsFullScan={setIsFullScan}
            />
          <button className="p-2 rounded-full hover:bg-primary"><BellIcon className="w-6 h-6" /></button>
          <ProfileMenu />
        </div>
      </header>
      
      {recentGames.length > 0 && <section>
        <h2 className="text-2xl font-semibold mb-4">Недавно играли</h2>
        {loading ? <p>Загрузка...</p> : (
          <div className="grid-library" style={gridRecentStyle}>
            {recentGames.map(game => (
              <RecentGameCard key={game.path} game={game} iconDataUrl={game.icon_url} />
            ))}
          </div>
        )}
      </section>}

      <section className="mt-12">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Все игры</h2>
            <div className="flex items-center bg-primary rounded-md p-1 space-x-1">
                <TabButton value="all" label="Все" />
                <TabButton value="favorites" label="Избранное" />
            </div>
            <button onClick={() => setShowHidden(!showHidden)} className="p-2 rounded-full hover:bg-primary">
                {showHidden ? <EyeIcon className="w-6 h-6" /> : <EyeSlashIcon className="w-6 h-6" />}
            </button>
        </div>
        {loading ? <p>Загрузка...</p> : (
                <div className="grid-library" style={gridStyle}>
                    {processedGames.map(game => (
                        <PosterGameCard 
                            key={game.path} 
                            game={game} 
                            iconUrl={game.icon_url || undefined} 
                            aspectRatio={gridConfig.ratio} 
                        />
                    ))}
                </div>
            )}
      </section>
    </div>
  );
}

export default LibraryPage;