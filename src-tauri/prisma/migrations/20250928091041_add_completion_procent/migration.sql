-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "path" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "game_type" TEXT NOT NULL,
    "play_time_seconds" INTEGER NOT NULL DEFAULT 0,
    "icon_path" TEXT,
    "description" TEXT,
    "version" TEXT,
    "last_played" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "completion_percent" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Game" ("description", "game_type", "icon_path", "is_hidden", "last_played", "name", "path", "play_time_seconds", "rating", "version") SELECT "description", "game_type", "icon_path", "is_hidden", "last_played", "name", "path", "play_time_seconds", "rating", "version" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
