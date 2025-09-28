import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ArchiveBoxIcon, ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';

export type RestoreStrategy = 'backup' | 'rename' | 'delete';

interface RestoreStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStrategy: (strategy: RestoreStrategy) => void;
}

export function RestoreStrategyModal({ isOpen, onClose, onSelectStrategy }: RestoreStrategyModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* ... (код затемнения фона, как в ConfirmModal) */}
        <div className="fixed inset-0 bg-black bg-opacity-50" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child /* ... */>
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                  Обнаружены существующие сохранения
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-400">
                    Что сделать с текущей папкой сохранений перед восстановлением из бэкапа?
                  </p>
                </div>

                <div className="mt-4 space-y-4">
                  <button onClick={() => onSelectStrategy('backup')} className="w-full flex items-start text-left p-4 rounded-lg hover:bg-gray-700">
                    <ArchiveBoxIcon className="h-6 w-6 text-blue-400 mr-4 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Создать бэкап и заменить (рекомендуется)</p>
                      <p className="text-xs text-gray-400">Текущие сохранения будут заархивированы в новый .zip файл, а затем заменены.</p>
                    </div>
                  </button>
                  <button onClick={() => onSelectStrategy('rename')} className="w-full flex items-start text-left p-4 rounded-lg hover:bg-gray-700">
                    <ArrowPathIcon className="h-6 w-6 text-yellow-400 mr-4 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Переименовать и заменить</p>
                      <p className="text-xs text-gray-400">Текущая папка `saves` будет переименована в `saves_old_...`.</p>
                    </div>
                  </button>
                  <button onClick={() => onSelectStrategy('delete')} className="w-full flex items-start text-left p-4 rounded-lg hover:bg-gray-700">
                    <TrashIcon className="h-6 w-6 text-red-400 mr-4 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Удалить и заменить</p>
                      <p className="text-xs text-gray-400">ВНИМАНИЕ: Текущие сохранения будут безвозвратно удалены.</p>
                    </div>
                  </button>
                </div>
                <div className="mt-4 text-right">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Отмена</button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}