import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { PhotoIcon, ClipboardDocumentIcon, TrashIcon } from '@heroicons/react/24/outline'; // Используем outline для консистентности

interface ActionMenuProps {
  onIconChange: () => void;
  onPasteIcon: () => void;
  onDeleteIcon?: () => void; // Опциональная функция удаления
}

export function ActionMenu({ onIconChange, onPasteIcon, onDeleteIcon }: ActionMenuProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
          <EllipsisVerticalIcon className="size-7" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-600 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1 ">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onIconChange}
                  className={`${
                    active ? 'bg-blue-500 text-white' : 'text-gray-200'
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  <PhotoIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  Выбрать файл
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onPasteIcon}
                  className={`${
                    active ? 'bg-blue-500 text-white' : 'text-gray-200'
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  <ClipboardDocumentIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  Вставить из буфера
                </button>
              )}
            </Menu.Item>
          </div>
          {onDeleteIcon && (
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onDeleteIcon}
                    className={`${
                      active ? 'bg-red-500 text-white' : 'text-red-400'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    <TrashIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                    Удалить иконку
                  </button>
                )}
              </Menu.Item>
            </div>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}