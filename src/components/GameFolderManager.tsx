import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { addGameToFolder, removeGameFromFolder } from '../utils/db';
import { useFolders } from '../hooks/useFolders'; // Наш хук для получения всех папок
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface GameFolderManagerProps {
  gamePath: string;
  // Массив ID папок, в которых игра УЖЕ состоит
  initialFolderIds: number[];
  // Callback, чтобы родительский компонент знал об изменениях
  onFoldersChange: (newFolderIds: number[]) => void;
}

function GameFolderManager({ gamePath, initialFolderIds, onFoldersChange }: GameFolderManagerProps) {
  const { folders, loading } = useFolders(); // Получаем список всех папок

  const handleFolderToggle = async (folderId: number) => {
    const isInFolder = initialFolderIds.includes(folderId);
    let newFolderIds: number[];

    if (isInFolder) {
      // Убираем игру из папки
      await removeGameFromFolder(gamePath, folderId);
      newFolderIds = initialFolderIds.filter(id => id !== folderId);
    } else {
      // Добавляем игру в папку
      await addGameToFolder(gamePath, folderId);
      newFolderIds = [...initialFolderIds, folderId];
    }
    // Сообщаем родителю об изменениях
    onFoldersChange(newFolderIds);
  };

  if (loading) {
    return <div className="text-sm text-gray-400">Загрузка папок...</div>;
  }

  return (
    <Popover className="relative">
      <Popover.Button className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6 text-white bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md">
        <span>Управление папками</span>
        <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute left-0 z-10 mt-2 flex w-screen max-w-xs px-4">
          <div className="w-full flex-auto overflow-hidden rounded-lg bg-gray-800 text-sm leading-6 shadow-lg ring-1 ring-gray-700">
            <div className="p-4 max-h-60 overflow-y-auto">
              {folders.length === 0 ? (
                 <p className="text-gray-400">Папок не найдено. Создайте их в сайдбаре.</p>
              ) : (
                folders.map((folder) => (
                  <div key={folder.id} className="relative flex items-center gap-x-4 rounded-lg p-2 hover:bg-gray-700">
                    <input
                      id={`folder-${folder.id}`}
                      type="checkbox"
                      checked={initialFolderIds.includes(folder.id)}
                      onChange={() => handleFolderToggle(folder.id)}
                      className="h-4 w-4 rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-600"
                    />
                    <label htmlFor={`folder-${folder.id}`} className="font-semibold text-white">
                      {folder.name}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}

export default GameFolderManager;