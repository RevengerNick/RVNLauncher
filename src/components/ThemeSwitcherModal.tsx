import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { setTheme, applyInitialTheme } from '../utils/theme';
import { useState, useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/20/solid';

interface ThemeSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const availableThemes = [
    { id: 'dark', name: 'Onyx', description: 'Классическая тёмная тема', bg: '#111827', text: '#ffffff' },
    { id: 'light', name: 'Light', description: 'Светлая и чистая тема', bg: '#F9FAFB', text: '#111827' },
    { id: 'forest', name: 'Forest', description: 'Тёмная тема в лесных тонах', bg: '#1a2a1a', text: '#ffffff' },
    // Добавь сюда новые темы
];

export function ThemeSwitcherModal({ isOpen, onClose }: ThemeSwitcherModalProps) {
  const [currentTheme, setCurrentTheme] = useState('');

  useEffect(() => {
    if (isOpen) {
      applyInitialTheme().then(setCurrentTheme);
    }
  }, [isOpen]);

  const handleThemeChange = async (newTheme: string) => {
    setCurrentTheme(newTheme);
    await setTheme(newTheme);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild as={Fragment} 
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95" >
          <div className="fixed inset-0 bg-secondary/70" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild as={Fragment} 
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95" >
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-bg-secondary p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" className="text-lg font-medium leading-6 text-text-primary">
                  Выбор темы оформления
                </DialogTitle>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableThemes.map((theme) => (
                    <div 
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className="relative cursor-pointer rounded-lg border-2 p-4 transition-all"
                      style={{
                        backgroundColor: theme.bg,
                        borderColor: currentTheme === theme.id ? 'var(--accent-primary)' : 'transparent'
                      }}
                    >
                      {currentTheme === theme.id && (
                        <div className="absolute top-2 right-2">
                            <CheckCircleIcon className="h-6 w-6 text-accent-primary" />
                        </div>
                      )}
                      <p className={`font-semibold`} style={{ color: theme.text }}>{theme.name}</p>
                      <p className={`text-sm`} style={{ color: theme.text }}>{theme.description}</p>
                    </div>
                  ))}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}