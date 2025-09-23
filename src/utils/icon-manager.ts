import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { copyFile, exists, BaseDirectory, mkdir } from '@tauri-apps/plugin-fs';
import { appDataDir, join } from '@tauri-apps/api/path';
import { convertFileSrc, invoke } from '@tauri-apps/api/core';

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

export async function getIconAsDataUrl(iconPath: string): Promise<string | null> {
  try {
    // Вызываем нашу Rust-команду
    // invoke для бинарных данных возвращает объект, где байты лежат в поле payload
    const response = await invoke<any>('read_icon_as_bytes', { path: iconPath });
    
    // --- ВАЖНОЕ ИЗМЕНЕНИЕ ЗДЕСЬ ---
    // Мы берем байты из поля `payload` ответа
    const bytes = new Uint8Array(response.payload); 

    // Преобразуем массив байт в строку Base64
    // Этот код может быть медленным для больших файлов, но для иконок подойдет
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    // Определяем MIME-тип по расширению файла
    const extension = iconPath.split('.').pop()?.toLowerCase() || 'png';
    const mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;

    // Формируем Data URL
    return `data:${mimeType};base64,${base64}`;

  } catch (error) {
    console.error(`Не удалось загрузить иконку по пути ${iconPath}:`, error);
    return null;
  }
}