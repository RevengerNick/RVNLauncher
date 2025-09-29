import { GameEntry } from "../utils/db";
import { useDebouncedCallback } from "use-debounce";

interface GameMetadataProps {
  game: GameEntry;
  onDescriptionChange: (description: string) => void;
  onVersionChange: (version: string) => void;
}

export function GameMetadata({ game, onDescriptionChange, onVersionChange }: GameMetadataProps) {
  const debouncedSaveDescription = useDebouncedCallback(onDescriptionChange, 1000);
  const debouncedSaveVersion = useDebouncedCallback(onVersionChange, 1000);

  return (
    <div className="mt-8 space-y-6">  
      <div>
        <h2 className="text-2xl font-bold mb-2 text-text-primary">Описание</h2>
        <textarea 
          className="w-full bg-secondary p-2 rounded border text-text-primary border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={5}
          defaultValue={game.description || ''}
          placeholder="Добавьте ваше описание..."
          onChange={(e) => debouncedSaveDescription(e.target.value)}
        ></textarea>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-2 text-text-primary">Версия</h2>
        <input 
          type="text"
          className="w-full bg-secondary p-2 rounded border text-text-primary border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          defaultValue={game.version || ''}
          placeholder="Укажите версию игры..."
          onChange={(e) => debouncedSaveVersion(e.target.value)}
        />
      </div>
    </div>
  );
}