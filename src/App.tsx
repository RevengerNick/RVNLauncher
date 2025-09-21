import { useState } from 'react';
import { invoke } from "@tauri-apps/api/core";
// Компоненты Command не нужны здесь, они используются в utils/start-game.ts
// import { Command } from '@tauri-apps/plugin-shell'; 

import './App.css';
import { callLaunchGameCommand } from './utils/start-game'; 
import { selectGameDirectory, scanForGames, GameInfo } from './utils/game-scanner'; // Импортируем сканер

function App() {
  const [greeting, setGreeting] = useState('');
  const [name, setName] = useState('');
  const [scannedGames, setScannedGames] = useState<GameInfo[]>([]);

  const callGreetCommand = async () => {
    const result = await invoke<string>('greet', { name: name });
    setGreeting(result);
  };

  const handleScanDirectory = async () => {
    const selectedDir = await selectGameDirectory();
    if (selectedDir) {
      const games = await scanForGames(selectedDir);
      setScannedGames(games);
      console.log('Найденные игры:', games);
    }
  };
  
  return (
    <div className="container">
      <h1>Добро пожаловать в твой будущий лаунчер!</h1>

      {/* Блок с приветствием */}
      <div className="row">
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Введи свое имя..."
        />
        <button type="button" onClick={callGreetCommand}>
          Привет!
        </button>
      </div>
      <p>{greeting}</p>

      <hr />

      {/* Кнопка для запуска конкретной игры (как ты сделал ранее, для проверки) */}
      <div className="row">
        <button type="button" onClick={() => callLaunchGameCommand("E:/Novels/SingleAgainCHP1-1.23-pc/SingleAgainCHP1.exe")}>
          Запустить игру с отслеживанием (тест)
        </button>
      </div>

      <hr />

      {/* Новый блок для выбора папки и сканирования */}
      <div className="row">
        <button type="button" onClick={handleScanDirectory}>
          Выбрать папку и найти игры
        </button>
      </div>

      {/* Отображение найденных игр */}
      {scannedGames.length > 0 && (
        <div className="game-list">
          <h2>Найденные игры:</h2>
          <ul>
            {scannedGames.map((game) => (
              <li key={game.path}>
                {game.name} ({game.type}) -{' '}
                <button onClick={() => callLaunchGameCommand(game.path)}>
                  Запустить
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;