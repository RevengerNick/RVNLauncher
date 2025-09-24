import { useState, useEffect, useCallback } from 'react';
import { getSetting, setSetting } from '../utils/db';

const THEME_KEY = 'theme';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await getSetting(THEME_KEY);
      if (savedTheme === 'light') {
        setTheme('light');
        document.documentElement.classList.remove('dark');
      } else {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }
      setLoading(false);
    };
    loadTheme();
  }, []);

  const updateTheme = useCallback(async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    await setSetting(THEME_KEY, newTheme);
  }, []);

  return { theme, loading, updateTheme };
}