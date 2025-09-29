import { useState, useEffect } from 'react';
import { getSetting, setSetting } from '../utils/db';

const SETTINGS_KEYS = {
    GRID_SMALL: 'gridSmall',
    GRID_LARGE: 'gridLarge',
    POSTER_RATIO: 'posterRatio',
};
const RATIOS = ['2/3', '3/4', '4/3', '1/1', '16/9', '9/16']; 

function SettingsPage() {
  const [gridSmall, setGridSmall] = useState(4);
  const [gridLarge, setGridLarge] = useState(6);
  const [posterRatio, setPosterRatio] = useState('2/3');

  useEffect(() => {
    const loadSettings = async () => {
      const small = await getSetting(SETTINGS_KEYS.GRID_SMALL);
      const large = await getSetting(SETTINGS_KEYS.GRID_LARGE);
      const ratio = await getSetting(SETTINGS_KEYS.POSTER_RATIO);

      if (small) setGridSmall(parseInt(small, 10));
      if (large) setGridLarge(parseInt(large, 10));
      if (ratio) setPosterRatio(ratio);
    };
    loadSettings();
  }, []);

  const handleSaveSetting = async (key: string, value: string | number) => {
    await setSetting(key, value.toString());
    console.log(`Настройка сохранена: ${key} = ${value}`);
  };  


  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Настройки приложения</h1>
      
      <div className="bg-secondary p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-text-primary">Настройки библиотеки</h2>

        <div className="mb-6">
          <label className="block text-text-secondary mb-2">Колонок на маленьких экранах (Mobile/Tablet): <span className="font-bold text-text-primary">{gridSmall}</span></label>
          <input
            type="range"
            min="2"
            max="8" 
            value={gridSmall}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setGridSmall(val);
              handleSaveSetting(SETTINGS_KEYS.GRID_SMALL, val);
            }}
            className="w-full h-2 bg-tertiary rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-text-secondary mb-2">Колонок на больших экранах (Desktop/Wide): <span className="font-bold text-text-primary">{gridLarge}</span></label>
          <input
            type="range"
            min="4"
            max="12" 
            value={gridLarge}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setGridLarge(val);
              handleSaveSetting(SETTINGS_KEYS.GRID_LARGE, val);
            }}
            className="w-full h-2 bg-tertiary rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="mt-8">
            <h3 className="text-text-secondary mb-2">Соотношение сторон постера:</h3>
            <div className="flex flex-wrap gap-3">
                {RATIOS.map(ratio => (
                    <button 
                        key={ratio}
                        onClick={() => {setPosterRatio(ratio); handleSaveSetting(SETTINGS_KEYS.POSTER_RATIO, ratio)}}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${ratio === posterRatio ? 'bg-green-600 text-text-primary' : 'bg-primary hover:bg-tertiary'}`}
                    >
                        {ratio.replace('/', ':')}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;