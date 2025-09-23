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
    rating: number;
    is_hidden: boolean;
}

export interface Folder {
    id: number;
    name: string;
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

export async function updateGameIcon(path: string, iconPath: string): Promise<void> {
    await invoke('db_update_game_icon', { path, iconPath });
}

export async function updateGamePlaytime(path: string, sessionSeconds: number): Promise<void> {
    await invoke('db_update_game_playtime', { path, sessionSeconds });
}

export async function updateGameRating(path: string, rating: number): Promise<void> {
    await invoke('db_update_game_rating', { path, rating });
}

export async function updateGameVersion(path: string, version: string): Promise<void> {
    await invoke('db_update_game_version', { path, version });
}

export async function updateGameName(path: string, name: string): Promise<void> {
    await invoke('db_update_game_name', { path, name });
}

export async function toggleGameHidden(path: string, isHidden: boolean): Promise<void> {
    await invoke('db_toggle_game_hidden', { path, isHidden });
}

export async function createFolder(name: string): Promise<number> {
    return await invoke('db_create_folder', { name });
}

export async function getAllFolders(): Promise<Folder[]> {
    return await invoke('db_get_all_folders');
}

export async function addGameToFolder(gamePath: string, folderId: number): Promise<void> {
    await invoke('db_add_game_to_folder', { gamePath, folderId });
}

export async function removeGameFromFolder(gamePath: string, folderId: number): Promise<void> {
    await invoke('db_remove_game_from_folder', { gamePath, folderId });
}

export async function getGamesByFolder(folderId: number): Promise<GameEntry[]> {
    return await invoke('db_get_games_by_folder', { folderId });
}

export async function getFoldersForGame(gamePath: string): Promise<number[]> {
    return await invoke('db_get_folders_for_game', { gamePath });
}

export async function deleteGame(gamePath: string): Promise<void> {
    console.log(gamePath);
    //await invoke('db_delete_game', { gamePath });
}
