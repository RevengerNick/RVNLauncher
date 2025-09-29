import { Popover, Transition, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ChevronDownIcon, Cog6ToothIcon, LanguageIcon, PaintBrushIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Fragment, useState } from 'react';
import { ThemeSwitcherModal } from './ThemeSwitcherModal';
import { Link } from 'react-router-dom';

export function ProfileMenu() {
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  return (
    <>
      <ThemeSwitcherModal 
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      <Popover className="relative">
        <PopoverButton className="flex items-center gap-2 p-1 rounded-full hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary">
            <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 border-2 border-transparent" 
            >
                <UserCircleIcon className="w-6 h-6 text-text-secondary" />
            </div>
            <ChevronDownIcon className="w-4 h-4 text-text-secondary" />
        </PopoverButton>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <PopoverPanel className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-secondary shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <button 
                onClick={() => setIsThemeModalOpen(true)}
                className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white"
              >
                <PaintBrushIcon className="mr-2 h-5 w-5" />
                Сменить тему
              </button>
              <button className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white">
                <LanguageIcon className="mr-2 h-5 w-5" />
                Сменить язык
              </button> 
              <Link to="/settings" className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white">
                <Cog6ToothIcon className="mr-2 h-5 w-5" />
                Настройки
              </Link>
            </div>
          </PopoverPanel>
        </Transition>
      </Popover>
    </>
  );
}