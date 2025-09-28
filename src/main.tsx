import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Импортируем
import App from './App';
import './App.css';
import { GameSessionProvider } from './context/GameSessionContext';
import { ConfirmProvider } from './context/ConfirmContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <GameSessionProvider>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </GameSessionProvider>
    </BrowserRouter>
  </React.StrictMode>
);