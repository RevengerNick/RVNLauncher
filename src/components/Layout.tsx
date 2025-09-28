import { Outlet, NavLink } from 'react-router-dom';
import { useFolders } from '../hooks/useFolders';
import { HomeIcon, FolderIcon, Cog6ToothIcon, PlusIcon } from '@heroicons/react/24/outline';
import { ArrowLeftOnRectangleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast'; // Для уведомлений
import React from 'react';

function Layout() {
  const { folders, addFolder } = useFolders();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const handleCreateFolder = async () => {
    const name = prompt('Введите название новой папки:');
    if (name) {
      await addFolder(name);
    }
  };

  const NavItem = ({ to, icon, children }: { to: string, icon: React.ElementType, children: React.ReactNode }) => (
      <NavLink to={to} end className={({ isActive }) => `flex items-center gap-4 py-2 px-3 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-blue-500/80 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
        {React.createElement(icon, { className: "h-5 w-5 flex-shrink-0" })}
        <span className={`transition-opacity duration-200 ${!isSidebarExpanded && 'opacity-0'}`}>{children}</span>
      </NavLink>
  );

  return (
    // Основной фон теперь темный, как в референсе
    <div className="flex h-screen bg-[#171122] text-white">
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'bg-gray-700 text-white shadow-lg rounded-md',
          style: { background: '#1f2937', color: '#f9fafb' },
          duration: 4000,
        }}
      />

      {/* Сайдбар (остается почти без изменений) */}
      <aside 
        className={`bg-gray-800 text-gray-200 flex flex-col transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'w-48' : 'w-16'}`}
      >
        <div className="flex items-center justify-center h-16 flex-shrink-0 px-4">
          {/* Убрали текст RVN Launcher, можно добавить иконку-логотип */}
        </div>
        
        <nav className="flex-1 px-2 space-y-1">
          <NavItem to="/" icon={HomeIcon}>Библиотека</NavItem>
          
          {/* Папки теперь тоже как NavItem */}
          {folders.map(folder => (
            <NavItem key={folder.id} to={`/folder/${folder.id}`} icon={FolderIcon}>
              {folder.name}
            </NavItem>
          ))}
          
          <button onClick={handleCreateFolder} className="flex items-center w-full gap-4 py-2 px-3 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
            <div className="flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              {isSidebarExpanded && <span className={`transition-opacity duration-200 opacity-100 whitespace-nowrap`}>Новая папка</span>}
            </div>
          </button>
        </nav>

        {/* Настройки и кнопка сворачивания */}
        <div className="px-2 pb-4 space-y-1">
          <NavItem to="/settings" icon={Cog6ToothIcon}>Настройки</NavItem>
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="flex items-center w-full gap-4 py-2 px-3 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
            <div className="flex items-center gap-2">
              {isSidebarExpanded ? <ArrowLeftOnRectangleIcon className="h-5 w-5" /> : <ArrowRightOnRectangleIcon className="h-5 w-5" />}
              <span className={`transition-opacity duration-200 ${!isSidebarExpanded && 'opacity-0'}`}>Свернуть</span>
            </div>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;