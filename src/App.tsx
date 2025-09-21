import { Routes, Route } from 'react-router-dom';
import Library from './pages/Library';
import GamePage from './pages/GamePage';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Library />} /> 
        <Route path="game/:gamePath" element={<GamePage />} /> 
      </Route>
    </Routes>
  );
}

export default App;