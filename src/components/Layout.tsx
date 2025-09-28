import { Outlet, NavLink } from 'react-router-dom';
import { useFolders } from '../hooks/useFolders'; // Используем наш хук
import { useState } from 'react';
import { Bars3Icon, FolderIcon, HomeIcon, XMarkIcon } from '@heroicons/react/16/solid';
import { Toaster } from 'react-hot-toast';

function Layout() {
  const { folders, addFolder } = useFolders(); // Получаем папки и функцию добавления
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleCreateFolder = async () => {
    const name = prompt('Введите название новой папки:');
    if (name) {
      await addFolder(name);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* --- САЙДБАР --- */}
      <Toaster 
        position="top-right" // Позиция
        toastOptions={{
          // Стили для темной темы
          className: 'bg-gray-700 text-white shadow-lg rounded-md',
          style: {
            background: '#374151', // bg-gray-700
            color: '#F9FAFB',     // text-gray-50
          },
          // Стандартное время отображения
          duration: 4000,
        }}
      />

      <aside 
        className={`
          bg-gray-800 p-4 flex flex-col transition-all duration-300
          ${isSidebarCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Верхняя часть с заголовком/кнопкой */}
        <div className="flex items-center mb-8">
          {!isSidebarCollapsed && <h1 className="text-2xl font-bold flex-1">RVN Launcher</h1>}
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-1 rounded-full hover:bg-gray-700">
            {isSidebarCollapsed ? <Bars3Icon className="size-12 p-2" /> : <XMarkIcon className="size-8" />}
          </button>
        </div>

        {/* Навигация */}
        <nav className="flex-1">
          <p className={`px-2 text-sm text-gray-400 font-semibold mb-2 ${isSidebarCollapsed ? 'text-center' : ''}`}>
            {!isSidebarCollapsed && 'Библиотека'}
          </p>
          <ul>
            <li>
              <NavLink to="/" end className={({ isActive }) => `flex items-center gap-4 py-2 px-2 rounded ${isActive ? 'bg-blue-500' : 'hover:bg-gray-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <HomeIcon className="h-6 w-6 flex-shrink-0" />
                {!isSidebarCollapsed && <span>Все игры</span>}
              </NavLink>
            </li>
          </ul>

          <p className={`px-2 text-sm text-gray-400 font-semibold mt-6 mb-2 ${isSidebarCollapsed ? 'text-center' : ''}`}>
             {!isSidebarCollapsed && 'Папки'}
          </p>
          <ul>
            {folders.map(folder => (
              <li key={folder.id}>
                <NavLink to={`/folder/${folder.id}`} className={({ isActive }) => `flex items-center gap-4 py-2 px-2 rounded ${isActive ? 'bg-blue-500' : 'hover:bg-gray-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                  <FolderIcon className="h-6 w-6 flex-shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">{folder.name}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Кнопка создания папки */}
        <button onClick={handleCreateFolder} className={`w-full flex items-center gap-4 font-bold py-2 px-4 rounded bg-green-600 hover:bg-green-700 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <span className="text-2xl">+</span>
          {!isSidebarCollapsed && <span>Новая папка</span>}
        </button>
      </aside>

      {/* --- ОСНОВНОЙ КОНТЕНТ --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;