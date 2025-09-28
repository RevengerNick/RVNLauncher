/**
 * Простая хэш-функция для строки.
 * @param str Входная строка (название игры).
 * @returns Числовой хэш.
 */
function simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Преобразуем в 32-битное целое
    }
    return hash;
  }
  
  /**
   * Генерирует два цвета для градиента на основе строки.
   * @param seed Строка для генерации (название игры).
   * @returns Объект с двумя цветами в формате hsl.
   */
  export function generateGradientColors(seed: string): { color1: string; color2: string } {
    const hash = simpleHash(seed);
    
    // Используем хэш для получения значений hue (оттенок)
    const hue1 = Math.abs(hash) % 360;
    const hue2 = (hue1 + 45) % 360; // Второй цвет со сдвигом в 45 градусов
  
    // Фиксируем saturation (насыщенность) и lightness (светлота) для пастельных тонов
    const saturation = 60;
    const lightness = 12;
  
    const color1 = `hsl(${hue1}, ${saturation}%, ${lightness}%)`;
    const color2 = `hsl(${hue2}, ${saturation}%, ${lightness}%)`;
  
    return { color1, color2 };
  }