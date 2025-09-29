import { Outlet, NavLink, Link } from 'react-router-dom';
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
      <NavLink to={to} end className={({ isActive }) => `flex items-center gap-4 py-2 px-3 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-accent-primary/80 text-text-primary' : 'text-text-primary hover:bg-primary hover:text-text-primary'}`}>
        {React.createElement(icon, { className: "h-5 w-5 flex-shrink-0" })}
        <span className={`transition-opacity duration-200 ${!isSidebarExpanded && 'opacity-0'}`}>{children}</span>
      </NavLink>
  );

  return (
    <div className="flex h-screen bg-primary text-text-primary">
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'bg-gray-700 text-white shadow-lg rounded-md',
          style: { background: '#1f2937', color: '#f9fafb' },
          duration: 4000,
        }}
      />

      <aside 
        className={`bg-secondary text-text-primary flex flex-col transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'w-48' : 'w-16'}`}
      >
        <Link to="/" className="flex items-center justify-center h-16 flex-shrink-0 ">
          <img src="/128x128@3x.png" alt="Logo" className="h-13 w-12" />
        </Link>
        
        <nav className="flex-1 px-2 space-y-1">
          <NavItem to="/" icon={HomeIcon}>Библиотека</NavItem>
          
          {folders.map(folder => (
            <NavItem key={folder.id} to={`/folder/${folder.id}`} icon={FolderIcon}>
              {folder.name}
            </NavItem>
          ))}
          
          <button onClick={handleCreateFolder} className="flex items-center w-full gap-4 py-2 px-3 rounded-md text-sm font-medium text-text-primary hover:bg-primary hover:text-text-primary">
            <div className="flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              {isSidebarExpanded && <span className={`transition-opacity duration-200 opacity-100 whitespace-nowrap`}>Новая папка</span>}
            </div>
          </button>
        </nav>

        <div className="px-2 pb-4 space-y-1">
          <NavItem to="/settings" icon={Cog6ToothIcon}>Настройки</NavItem>
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="flex items-center w-full gap-4 py-2 px-3 rounded-md text-sm font-medium text-text-primary hover:bg-primary hover:text-text-primary">
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