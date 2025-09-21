import { invoke } from "@tauri-apps/api/core";

// Этот интерфейс должен совпадать с GameEntry в Rust
export interface GameEntry {
    path: string;
    name: string;
    game_type: string;
    play_time_seconds: number;
    icon_path?: string;
    description?: string;
    version?: string;
    last_played?: string;
}

export async function addGameToDb(game: GameEntry): Promise<void> {
    await invoke('db_add_game', { game });
}

export async function getAllGamesFromDb(): Promise<GameEntry[]> {
    return await invoke('db_get_all_games');
}

export async function updateGameDescription(path: string, description: string): Promise<void> {
    await invoke('db_update_game_description', { path, description });
}