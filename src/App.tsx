import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LibraryPage from './pages/LibraryPage';
import GamePage from './pages/GamePage';
import SettingsPage from './pages/SettingsPage.tsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LibraryPage />} />
        <Route path="folder/:folderId" element={<LibraryPage />} />
        <Route path="game/:gamePath" element={<GamePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;