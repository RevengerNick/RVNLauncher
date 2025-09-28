import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameEntry, getAllGamesFromDb, getFoldersForGame, toggleGameHidden, updateGameDescription, updateGameIcon, updateGameName, updateGameRating, updateGameVersion } from '../utils/db';
import { selectIconFile, saveIconForGame, getIconUrl } from '../utils/icon-manager'; // Изменил getIconUrl на getIconAsDataUrl
import { useDebouncedCallback } from 'use-debounce';
import { revealItemInDir } from '@tauri-apps/plugin-opener'; // Добавил импорт
import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import toast from 'react-hot-toast';
import { getImageDimensions } from '../utils/image';

export function useGameDetails(gamePath: string | undefined) {
  const navigate = useNavigate();

  const [game, setGame] = useState<GameEntry | null>(null);
  const [gameFolderIds, setGameFolderIds] = useState<number[]>([]);
  const [iconDataUrl, setIconDataUrl] = useState<string | null>(null); // Изменил iconUrl на iconDataUrl
  const [loading, setLoading] = useState(true);
  const [iconOrientation, setIconOrientation] = useState<'landscape' | 'portrait' | 'square'>('portrait');

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

  useEffect(() => {
    let cancelled = false;
    const loadIcon = async () => {
      if (game?.icon_path) {
        // Здесь мы используем getIconAsDataUrl, так как он нужен для определения размеров
        const url = await convertFileSrc(game.icon_url || ''); 
        if (url && !cancelled) {
          setIconDataUrl(url);
          try {
            const dims = await getImageDimensions(url);
            if (!cancelled) setIconOrientation(dims.orientation);
          } catch (e) {
            if (!cancelled) setIconOrientation('portrait'); // По умолчанию, если ошибка
          }
        }
      } else {
        if (!cancelled) {
          setIconDataUrl(null);
          setIconOrientation('portrait'); // Сбрасываем к значению по умолчанию
        }
      }
    };
    loadIcon();
    return () => { cancelled = true; };
  }, [game?.icon_path]);

  const handleDeleteIcon = useCallback(async () => {
    if (game && window.confirm("Удалить обложку для этой игры?")) {
      // Мы просто удаляем путь к иконке из БД. Сам файл останется,
      // но его можно будет периодически чистить (это уже другая фича).
      await updateGameIcon(game.path, ''); // Сохраняем пустую строку
      setGame(prevGame => prevGame ? { ...prevGame, icon_path: '' } : null);
    }
  }, [game]);

  // --- Загрузка иконки (Data URL) ---
  useEffect(() => {
    let cancelled = false;
    const loadIcon = async () => {
      if (game?.icon_path) {
        const url = await getIconUrl(game.icon_path); 
        if (!cancelled) setIconDataUrl(url);
      } else {
        setIconDataUrl(null);
      }
    };
    loadIcon();
    return () => { cancelled = true; };
  }, [game?.icon_path]); 

  const handleSetIcon = useCallback(async () => {
    if (!game) return;

    const selectedFile = await selectIconFile();
    if (selectedFile) {
      try {
        const newIconPath = await saveIconForGame(selectedFile, game.path);
        await updateGameIcon(game.path, newIconPath);
        setGame(prevGame => prevGame ? { ...prevGame, icon_path: newIconPath } : null);
      } catch (error) {
        console.error("Не удалось сохранить иконку:", error);
      }
    }
  }, [game]);

  const handleRatingChange = useCallback(async (newRating: number) => {
    if (game && game.rating !== newRating) {
      await updateGameRating(game.path, newRating);
      setGame(prevGame => prevGame ? { ...prevGame, rating: newRating } : null);
    }
  }, [game]);

  const handleToggleHidden = useCallback(async () => {
    if (game) {
      await toggleGameHidden(game.path, !game.is_hidden);
      setGame(prevGame => prevGame ? { ...prevGame, is_hidden: !prevGame.is_hidden } : null);
    }
  }, [game]);

  const handleOpenFolder = useCallback(() => {
    if (game) {
      revealItemInDir(game.path); 
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

  const handlePasteIcon = async () => {
    if (!game) return;
    try {
      // Вызываем нашу новую Rust-команду
      const newIconPath = await invoke<string>('save_image_from_clipboard', { gamePath: game.path });
      // Обновляем иконку в БД и в состоянии
      await updateGameIcon(game.path, newIconPath);
      setGame({ ...game, icon_path: newIconPath });
      toast.success('Иконка из буфера обмена успешно установлена!');
    } catch (error) {
      console.error("Ошибка вставки иконки:", error);
      toast.error(`Ошибка: ${error}`);
    }
  };

  // Возвращаем все необходимые данные и функции
  return {
    game,
    loading,
    iconDataUrl, // Изменено
    iconOrientation,
    gameFolderIds,
    setGameFolderIds, // Функция для обновления папок из GameFolderManager
    handleSetIcon,
    handleRatingChange,
    handleToggleHidden,
    handleOpenFolder, // Для кнопки "Открыть папку"
    saveName,
    saveVersion,
    saveDescription,
    handlePasteIcon,
    handleDeleteIcon
  };
}