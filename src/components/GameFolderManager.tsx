import { Fragment } from 'react';
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { addGameToFolder, removeGameFromFolder } from '../utils/db';
import { useFolders } from '../hooks/useFolders'; // Наш хук для получения всех папок
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface GameFolderManagerProps {
  gamePath: string;
  initialFolderIds: number[];
  onFoldersChange: (newFolderIds: number[]) => void;
}

function GameFolderManager({ gamePath, initialFolderIds, onFoldersChange }: GameFolderManagerProps) {
  const { folders, loading } = useFolders(); // Получаем список всех папок

  const handleFolderToggle = async (folderId: number) => {
    const isInFolder = initialFolderIds.includes(folderId);
    let newFolderIds: number[];

    if (isInFolder) {
      await removeGameFromFolder(gamePath, folderId);
      newFolderIds = initialFolderIds.filter(id => id !== folderId);
    } else {
      await addGameToFolder(gamePath, folderId);
      newFolderIds = [...initialFolderIds, folderId];
    }
    onFoldersChange(newFolderIds);
  };

  if (loading) {
    return <div className="text-sm text-gray-400">Загрузка папок...</div>;
  }

  return (
    <Popover className="relative">
      <PopoverButton className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6 text-text-primary bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-md">
        <span>Управление папками</span>
        <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
      </PopoverButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <PopoverPanel className="absolute left-0 z-10 mt-2 flex w-screen max-w-xs px-4">
          <div className="w-full flex-auto overflow-hidden rounded-lg bg-secondary text-sm leading-6 shadow-lg ring-1 ring-gray-700">
            <div className="p-4 max-h-60 overflow-y-auto">
              {folders.length === 0 ? (
                 <p className="text-text-secondary">Папок не найдено. Создайте их в сайдбаре.</p>
              ) : (
                folders.map((folder) => (
                  <div key={folder.id} className="relative flex items-center gap-x-4 rounded-lg p-2 hover:bg-secondary/80">
                    <input
                      id={`folder-${folder.id}`}
                      type="checkbox"
                      checked={initialFolderIds.includes(folder.id)}
                      onChange={() => handleFolderToggle(folder.id)}
                      className="h-4 w-4 rounded border-tertiary bg-primary text-accent-primary focus:ring-accent-primary"
                    />
                    <label htmlFor={`folder-${folder.id}`} className="font-semibold text-text-primary">
                      {folder.name}
                    </label>
                  </div>
                ))
              )}
            </div>  
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}

export default GameFolderManager;