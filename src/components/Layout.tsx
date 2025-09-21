import { Outlet, NavLink } from 'react-router-dom';

function Layout() {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Боковая панель (сайдбар) */}
      <aside className="w-64 bg-gray-800 p-4">
        <h1 className="text-2xl font-bold mb-8">VN Launcher</h1>
        <nav>
          <ul>
            <li>
              {/* Ссылка на главную страницу */}
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `block py-2 px-4 rounded ${isActive ? 'bg-blue-500' : 'hover:bg-gray-700'}`
                }
              >
                Библиотека
              </NavLink>
            </li>
            {/* Здесь можно добавить ссылки на другие страницы, например, "Настройки" */}
          </ul>
        </nav>
      </aside>

      {/* Основной контент страницы */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet /> {/* Здесь будет рендериться Library или GamePage */}
      </main>
    </div>
  );
}

export default Layout;