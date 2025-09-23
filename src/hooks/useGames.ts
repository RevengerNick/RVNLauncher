import { useState, useEffect, useMemo } from 'react';
import { GameEntry, getAllGamesFromDb, getGamesByFolder } from '../utils/db';

interface UseGamesOptions {
  folderId?: number;
  sortBy?: 'rating' | 'name' | 'playtime';
  showHidden?: boolean;
}

export function useGames({ folderId, sortBy = 'rating', showHidden = false }: UseGamesOptions) {
  const [games, setGames] = useState<GameEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      try {
        let gamesFromDb;
        if (folderId) {
          gamesFromDb = await getGamesByFolder(folderId);
        } else {
          gamesFromDb = await getAllGamesFromDb();
        }
        setGames(gamesFromDb);
      } catch (error) {
        console.error("Failed to load games:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadGames();
  }, [folderId]); // Перезагружаем, когда меняется folderId

  const processedGames = useMemo(() => {
    const filtered = showHidden ? games : games.filter(g => !g.is_hidden);

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'playtime':
          return b.play_time_seconds - a.play_time_seconds;
        case 'rating':
        default:
          if (a.rating !== b.rating) {
            return b.rating - a.rating;
          }
          return a.name.localeCompare(b.name);
      }
    });
  }, [games, showHidden, sortBy]);

  // Функция для обновления состояния после сканирования
  const refreshGames = async () => {
      const allGames = await getAllGamesFromDb();
      setGames(allGames);
  }

  return { games: processedGames, loading, refreshGames };
}