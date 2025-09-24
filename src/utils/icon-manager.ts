import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { copyFile, exists, BaseDirectory, mkdir } from '@tauri-apps/plugin-fs';
import { appDataDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/core';

const ICONS_DIR = 'icons';

/**
 * Открывает диалог выбора файла изображения.
 * @returns Путь к выбранному файлу или null.
 */
export async function selectIconFile(): Promise<string | null> {
  const filePath = await openDialog({
    multiple: false,
    filters: [{
      name: 'Images',
      extensions: ['png', 'jpg', 'jpeg', 'webp']
    }]
  });

  return Array.isArray(filePath) ? filePath[0] : filePath;
}

/**
 * Копирует выбранный файл иконки в папку приложения и возвращает новый путь.
 * @param sourcePath Исходный путь к файлу иконки.
 * @param gamePath Уникальный путь к игре для создания имени файла.
 * @returns Путь к иконке внутри папки приложения.
 */
export async function saveIconForGame(sourcePath: string, gamePath: string): Promise<string> {
  const appDataDirPath = await appDataDir();
  const iconsDirPath = `${appDataDirPath}\\${ICONS_DIR}`;

  if (!await exists(iconsDirPath)) {
    await mkdir(iconsDirPath, { baseDir: BaseDirectory.AppData });
  }

  const extension = sourcePath.split('.').pop() || 'png';
  const safeGamePath = gamePath.replace(/[\\/:\*\?"<>\|]/g, '_');
  const newFileName = `${safeGamePath}.${extension}`;
  const destinationPath = `${iconsDirPath}\\${newFileName}`;

  await copyFile(sourcePath, destinationPath);
  return `${ICONS_DIR}\\${newFileName}`;
}

/**
 * Преобразует относительный путь к иконке в URL для использования в <img>
 * @param relativeIconPath Относительный путь (например, "icons\\game.png")
 * @returns URL-строка для тега <img>
 */
export async function getIconUrl(relativeIconPath: string): Promise<string> {
  try {
    const appData = await appDataDir();
    const fullPath = await join(appData, relativeIconPath);
    return convertFileSrc(fullPath);
  } catch (error) {
    console.error('Ошибка при получении URL иконки:', error);
    return '';
  }
}
