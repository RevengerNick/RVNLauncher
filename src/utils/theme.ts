import { getSetting, setSetting } from './db';

const THEME_KEY = 'theme';
const THEMES = ['dark', 'light', 'forest']; // Список всех тем

/**
 * Применяет сохраненную тему к <html>.
 * Вызывается один раз при запуске приложения.
 */
export async function applyInitialTheme() {
  const savedTheme = await getSetting(THEME_KEY);
  // Тема по умолчанию, если ничего не сохранено
  const themeToApply = savedTheme && THEMES.includes(savedTheme) ? savedTheme : 'dark';
  
  document.documentElement.className = themeToApply;
  return themeToApply;
}

/**
 * Устанавливает новую тему.
 * @param newTheme Имя класса темы (например, 'theme-light').
 */
export async function setTheme(newTheme: string) {
  if (THEMES.includes(newTheme)) {
    await setSetting(THEME_KEY, newTheme);
    document.documentElement.className = newTheme;
  }
}

export function getTheme() {
  return document.documentElement.className;
}