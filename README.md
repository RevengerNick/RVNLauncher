# VN Launcher

![Скриншот вашего лаунчера](ссылка_на_скриншот.png)

A lightweight, cross-platform launcher for your visual novel collection, built with Tauri and React.

## Features

-   **Cross-Platform:** Works on Windows, macOS, and Linux.
-   **Lightweight:** Uses only ~20MB of RAM thanks to Tauri.
-   **Game Library:** Scan folders to automatically find and add your games.
-   **Metadata:** Edit game titles, descriptions, versions, and ratings.
-   **Custom Icons:** Set custom cover art for each game.
-   **Playtime Tracking:** Automatically tracks how long you play each game.
-   **Save Backups:** Create local backups of your game saves with one click.
-   **Organization:** Group your games into custom folders.
-   **And more...** (Search, sorting, dark/light theme, etc.)

## Installation

1.  Go to the [**Latest Release**](https://github.com/твой-ник/имя-репозитория/releases/latest) page.
2.  Download the appropriate installer for your operating system:
    -   **Windows:** `_x64-setup.exe` or `.msi`
    -   **macOS:** `.dmg`
    -   **Linux:** `.AppImage` or `.deb`
3.  Run the installer and follow the instructions.

## Development

To run the project in development mode:

```bash
# Clone the repository
git clone https://github.com/твой-ник/имя-репозитория.git
cd имя-репозитория

# Install dependencies
pnpm install

# Run the app
pnpm tauri dev