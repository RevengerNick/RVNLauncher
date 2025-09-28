import { useState } from 'react';
import { selectGameDirectory, scanForGames } from '../utils/game-scanner';
import { addGameToDb, GameEntry } from '../utils/db';

interface LibraryHeaderProps {
  title: string;
  onScanComplete: () => void;
}

function LibraryHeader({ title, onScanComplete }: LibraryHeaderProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [isFullScan, setIsFullScan] = useState(false);

    const handleScanDirectory = async () => {
        const selectedDir = await selectGameDirectory();
        if (selectedDir) {
            setIsScanning(true);
            const scannedRaw = await scanForGames(selectedDir, isFullScan);
            
            // Здесь мы не используем `games.some`, так как этот компонент не знает о текущем списке
            for (const scannedGame of scannedRaw) {
                const newGameEntry: GameEntry = {
                    ...scannedGame,
                    name: scannedGame.name.replace(/\.(exe|py|sh|bat|cmd)$/i, ''),
                    play_time_seconds: 0,
                    rating: 0,
                    is_hidden: false,
                    version: scannedGame.version,
                    description: '',
                    icon_path: '',
                    last_played: '',
                    completion_percent: 0,
                };
                await addGameToDb(newGameEntry);
            }
            setIsScanning(false);
            onScanComplete(); // Сообщаем родительскому компоненту, что нужно обновить список
        }
    };
    
    return (
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">{title}</h2>
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-blue-500 bg-gray-700 border-gray-600 rounded"
                        checked={isFullScan} 
                        onChange={(e) => setIsFullScan(e.target.checked)} 
                    />
                    <span>Полный поиск</span>
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
    );
}

export default LibraryHeader;