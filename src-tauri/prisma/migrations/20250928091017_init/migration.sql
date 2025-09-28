-- CreateTable
CREATE TABLE "Game" (
    "path" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "game_type" TEXT NOT NULL,
    "play_time_seconds" INTEGER NOT NULL DEFAULT 0,
    "icon_path" TEXT,
    "description" TEXT,
    "version" TEXT,
    "last_played" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "GameFolder" (
    "game_path" TEXT NOT NULL,
    "folder_id" INTEGER NOT NULL,

    PRIMARY KEY ("game_path", "folder_id"),
    CONSTRAINT "GameFolder_game_path_fkey" FOREIGN KEY ("game_path") REFERENCES "Game" ("path") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GameFolder_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "Folder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Folder_name_key" ON "Folder"("name");
