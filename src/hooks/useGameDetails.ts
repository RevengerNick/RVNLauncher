import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameEntry, getAllGamesFromDb, getFoldersForGame, toggleGameHidden, updateGameDescription, updateGameIcon, updateGameName, updateGameRating, updateGameVersion } from '../utils/db';
import { selectIconFile, saveIconForGame, getIconAsDataUrl } from '../utils/icon-manager'; // Изменил getIconUrl на getIconAsDataUrl
import { useDebouncedCallback } from 'use-debounce';
import { revealItemInDir } from '@tauri-apps/plugin-opener'; // Добавил импорт

export function useGameDetails() {
  const { gamePath } = useParams<{ gamePath: string }>();
  const navigate = useNavigate();

  const [game, setGame] = useState<GameEntry | null>(null);
  const [gameFolderIds, setGameFolderIds] = useState<number[]>([]);
  const [iconDataUrl, setIconDataUrl] = useState<string | null>(null); // Изменил iconUrl на iconDataUrl
  const [loading, setLoading] = useState(true);

  const decodedPath = gamePath ? decodeURIComponent(gamePath) : '';

  // --- Загрузка данных игры и папок ---
  useEffect(() => {
    if (!decodedPath) {
        setLoading(false); // Если пути нет, завершаем загрузку
        return;
    }

    setLoading(true);
    const loadData = async () => {
      try {
        const allGames = await getAllGamesFromDb();
        const foundGame = allGames.find(g => g.path === decodedPath);
        if (foundGame) {
          setGame(foundGame);
          const folderIds = await getFoldersForGame(foundGame.path);
          setGameFolderIds(folderIds);
        } else {
          navigate('/'); // Если игра не найдена, перенаправляем на главную
        }
      } catch (error) {
        console.error("Failed to load game data:", error);
        navigate('/'); // В случае ошибки загрузки тоже перенаправляем
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [decodedPath, navigate]);

  // --- Загрузка иконки (Data URL) ---
  useEffect(() => {
    let cancelled = false;
    const loadIcon = async () => {
      if (game?.icon_path) {
        const url = await getIconAsDataUrl(game.icon_path); // Используем getIconAsDataUrl
        if (!cancelled) setIconDataUrl(url);
      } else {
        setIconDataUrl(null);
      }
    };
    loadIcon();
    return () => { cancelled = true; };
  }, [game?.icon_path]); // Перезагружаем иконку, если path к ней изменился

  // --- Функции-обработчики ---

  const handleSetIcon = useCallback(async () => {
    if (!game) return;

    const selectedFile = await selectIconFile();
    if (selectedFile) {
      try {
        const newIconPath = await saveIconForGame(selectedFile, game.path);
        await updateGameIcon(game.path, newIconPath);
        // Обновляем game объект, чтобы useEffect для иконки сработал
        setGame(prevGame => prevGame ? { ...prevGame, icon_path: newIconPath } : null);
      } catch (error) {
        console.error("Не удалось сохранить иконку:", error);
      }
    }
  }, [game]);

  const handleRatingChange = useCallback(async (newRating: number) => {
    if (game && game.rating !== newRating) {
      await updateGameRating(game.path, newRating);
      // Обновляем game объект, чтобы UI обновился
      setGame(prevGame => prevGame ? { ...prevGame, rating: newRating } : null);
    }
  }, [game]);

  const handleToggleHidden = useCallback(async () => {
    if (game) {
      await toggleGameHidden(game.path, !game.is_hidden);
      // Обновляем game объект
      setGame(prevGame => prevGame ? { ...prevGame, is_hidden: !prevGame.is_hidden } : null);
    }
  }, [game]);

  const handleOpenFolder = useCallback(() => {
    if (game) {
      revealItemInDir(game.path); // Открытие папки с игрой
    }
  }, [game]);


  // --- Debounced-сохраняторы ---

  const saveName = useDebouncedCallback(async (newName: string) => {
    if (game && newName) {
      await updateGameName(game.path, newName);
      setGame(prevGame => prevGame ? { ...prevGame, name: newName } : null);
      console.log('Название сохранено!');
    }
  }, 1000);

  const saveVersion = useDebouncedCallback(async (newVersion: string) => {
    if (game) {
      await updateGameVersion(game.path, newVersion);
      setGame(prevGame => prevGame ? { ...prevGame, version: newVersion } : null);
      console.log('Версия сохранена!');
    }
  }, 1000);

  const saveDescription = useDebouncedCallback(async (newDescription: string) => {
    if (game) {
      await updateGameDescription(game.path, newDescription);
      setGame(prevGame => prevGame ? { ...prevGame, description: newDescription } : null);
      console.log('Описание сохранено!');
    }
  }, 1000);

  // Возвращаем все необходимые данные и функции
  return {
    game,
    loading,
    iconDataUrl, // Изменено
    gameFolderIds,
    setGameFolderIds, // Функция для обновления папок из GameFolderManager
    handleSetIcon,
    handleRatingChange,
    handleToggleHidden,
    handleOpenFolder, // Для кнопки "Открыть папку"
    saveName,
    saveVersion,
    saveDescription
  };
}