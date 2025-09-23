/**
 * Преобразует общее количество секунд в строку "X ч Y мин".
 * @param totalSeconds Общее количество секунд.
 * @returns Отформатированная строка.
 */
export function formatPlaytime(totalSeconds: number): string {
    if (totalSeconds < 60) {
        return "менее 1 мин.";
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let result = '';
    if (hours > 0) {
        result += `${hours} ч `;
    }
    if (minutes > 0) {
        result += `${minutes} мин`;
    }

    return result.trim();
}


/**
 * Форматирует "сырое" имя игры в читаемый вид.
 * 1. Заменяет '_' на пробелы.
 * 2. Вставляет пробел перед заглавной буквой (CamelCase -> Title Case).
 * @param rawName "Сырое" имя, например "MyBullyIsMyLover_Ch1"
 * @returns Отформатированное имя, например "My Bully Is My Lover Ch1"
 */
export function formatGameName(rawName: string): string {
    if (!rawName) return '';
  
    let formattedName = rawName.replace(/\.(exe|py|sh|bat|cmd)$/i, '');
    
    formattedName = formattedName.replace(/_/g, ' ');
    formattedName = formattedName.replace(/([a-z])([A-Z])/g, '$1 $2');
    formattedName = formattedName.replace(/([a-zA-Z])([0-9])/g, '$1 $2');
    formattedName = formattedName.replace(/\s+/g, ' ').trim();
  
    return formattedName;
}