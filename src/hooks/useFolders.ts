import { useState, useEffect, useCallback } from 'react';
import { Folder, getAllFolders, createFolder } from '../utils/db';

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFolders = useCallback(async () => {
    setLoading(true);
    try {
      const allFolders = await getAllFolders();
      setFolders(allFolders);
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const addFolder = useCallback(async (name: string) => {
    try {
      await createFolder(name);
      await fetchFolders(); // Перезагружаем список после добавления
    } catch (e) {
      console.error(e);
      alert('Папка с таким именем уже существует!');
    }
  }, [fetchFolders]);

  return { folders, loading, addFolder };
}