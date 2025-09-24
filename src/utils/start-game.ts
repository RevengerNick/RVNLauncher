import { Command } from "@tauri-apps/plugin-shell";
import { updateGamePlaytime } from "./db";

// Теперь функция принимает addSession и removeSession из контекста
export const callLaunchGameCommand = async (
  gamePath: string, 
  addSession: (path: string, pid: number) => void,
  removeSession: (path: string) => void,
) => {
    try {
      const command = Command.create("exec-game-use", ["/C", "start", "", `${gamePath}`]);
      console.log(command)
      const startTime = Date.now();

      command.on("close", () => {
        const endTime = Date.now();
        const durationSeconds = Math.round((endTime - startTime) / 1000);
        
        updateGamePlaytime(gamePath, durationSeconds)
          .then(() => console.log('Время игры обновлено.'))
          .catch(err => console.error('Ошибка обновления времени:', err));
        
        removeSession(gamePath);
      });
  
      command.on("error", (err) => {
        console.error("Ошибка запуска:", err);
        removeSession(gamePath);
      });

      const child = await command.spawn();
      
      addSession(gamePath, child.pid);
      console.log(`Процесс для "${gamePath}" запущен с PID: ${child.pid}.`);

    } catch (e) {
      console.error("Не удалось запустить игру:", e);
    }
  };