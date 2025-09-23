import { Outlet, NavLink } from 'react-router-dom';
import { useFolders } from '../hooks/useFolders'; // Используем наш хук

function Layout() {
  const { folders, addFolder } = useFolders(); // Получаем папки и функцию добавления

  const handleCreateFolder = async () => {
    const name = prompt('Введите название новой папки:');
    if (name) {
      await addFolder(name);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <aside className="w-64 bg-gray-800 p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-8">VN Launcher</h1>
        <nav className="flex-1">
          <p className="px-4 text-sm text-gray-400 font-semibold mb-2">Библиотека</p>
          <ul>
            <li>
              <NavLink 
                to="/" 
                end // `end` prop важен для главной ссылки, чтобы она не была активна для /folder/1
                className={({ isActive }) => 
                  `block py-2 px-4 rounded ${isActive ? 'bg-blue-500' : 'hover:bg-gray-700'}`
                }
              >
                Все игры
              </NavLink>
            </li>
          </ul>

          <p className="px-4 text-sm text-gray-400 font-semibold mt-6 mb-2">Папки</p>
          <ul>
            {folders.map(folder => (
              <li key={folder.id}>
                <NavLink 
                  to={`/folder/${folder.id}`}
                  className={({ isActive }) => 
                    `block py-2 px-4 rounded ${isActive ? 'bg-blue-500' : 'hover:bg-gray-700'}`
                  }
                >
                  {folder.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <button 
          onClick={handleCreateFolder}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          + Новая папка
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;