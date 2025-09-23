import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AllGamesPage from './pages/AllGamesPage';
import FolderPage from './pages/FolderPage';
import GamePage from './pages/GamePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<AllGamesPage />} />
        <Route path="folder/:folderId" element={<FolderPage />} />
        <Route path="game/:gamePath" element={<GamePage />} />
      </Route>
    </Routes>
  );
}

export default App;