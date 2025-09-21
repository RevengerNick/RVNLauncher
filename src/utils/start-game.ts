import { Command } from "@tauri-apps/plugin-shell";

export const callLaunchGameCommand = async (gamePath: string) => {
    try {
      console.log(`Попытка запустить: "${gamePath}"`);
  
      const command = Command.create("exec-game-use", ["/C", "start", gamePath]);
  
      const start = Date.now();
  
      command.on("close", (data) => {
        const duration = (Date.now() - start) / 1000;
        console.log(`Игра была запущена ${duration} секунд`);
      });
  
      command.on("error", (err) => {
        console.error("Ошибка запуска:", err);
      });
  
      await command.spawn();
    } catch (e) {
      console.error("Не удалось запустить игру:", e);
    }
  };