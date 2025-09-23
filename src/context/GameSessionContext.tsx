import { createContext, useState, useContext, ReactNode } from 'react';

interface GameSessionContextType {
  activeSessions: Map<string, number>; // Map<gamePath, pid>
  addSession: (gamePath: string, pid: number) => void;
  removeSession: (gamePath: string) => void;
  isGameRunning: (gamePath: string) => boolean;
}

const GameSessionContext = createContext<GameSessionContextType | undefined>(undefined);

export const GameSessionProvider = ({ children }: { children: ReactNode }) => {
  const [activeSessions, setActiveSessions] = useState<Map<string, number>>(new Map());

  const addSession = (gamePath: string, pid: number) => {
    setActiveSessions(prev => new Map(prev).set(gamePath, pid));
  };

  const removeSession = (gamePath: string) => {
    setActiveSessions(prev => {
      const newSessions = new Map(prev);
      newSessions.delete(gamePath);
      return newSessions;
    });
  };
  
  const isGameRunning = (gamePath: string) => {
    return activeSessions.has(gamePath);
  };

  return (
    <GameSessionContext.Provider value={{ activeSessions, addSession, removeSession, isGameRunning }}>
      {children}
    </GameSessionContext.Provider>
  );
};

export const useGameSession = () => {
  const context = useContext(GameSessionContext);
  if (context === undefined) {
    throw new Error('useGameSession must be used within a GameSessionProvider');
  }
  return context;
};