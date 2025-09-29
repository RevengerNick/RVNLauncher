import { GameEntry } from "../../utils/db";
import { useGameSession } from '../../context/GameSessionContext';
import { callLaunchGameCommand } from '../../utils/start-game';
import { TrashIcon, EyeIcon, EyeSlashIcon, FolderOpenIcon } from '@heroicons/react/24/outline';
import GameFolderManager from "../GameFolderManager";
import { motion } from 'framer-motion';

// Определяем тип для всех функций, которые мы ожидаем
type ActionHandlers = {
    onOpenFolder: () => void;
    onToggleHidden: () => void;
    onDeleteGame: () => void;
};

interface GamePageActionsProps {
    game: GameEntry;
    gameFolderIds: number[];
    setGameFolderIds: (ids: number[]) => void;
    handlers: ActionHandlers;
}

const ActionButton = ({ children, onClick, className = '' }: { children: React.ReactNode, onClick?: () => void, className?: string }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`h-10 px-4 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${className}`}
    >
        {children}
    </motion.button>
);


export function GamePageActions({ game, gameFolderIds, setGameFolderIds, handlers }: GamePageActionsProps) {
    const { addSession, removeSession, isGameRunning } = useGameSession();
    const isRunning = isGameRunning(game.path);

    return (
        <div className="flex flex-wrap gap-3 p-4 justify-center md:justify-start">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => callLaunchGameCommand(game.path, addSession, removeSession)}
                disabled={isRunning}
                className="h-10 px-6 bg-[#5417cf] text-text-primary text-sm font-bold rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                {isRunning ? 'Запущена' : 'Играть'}
            </motion.button>

            <GameFolderManager 
                gamePath={game.path}
                initialFolderIds={gameFolderIds}
                onFoldersChange={setGameFolderIds}
            />

            <ActionButton onClick={handlers.onOpenFolder} className="bg-[#302447] hover:bg-opacity-80">
                <FolderOpenIcon className="w-5 h-5" /> Открыть папку
            </ActionButton>

            <ActionButton onClick={handlers.onToggleHidden} className="bg-[#302447] hover:bg-opacity-80">
                {game.is_hidden ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
                {game.is_hidden ? 'Показать' : 'Скрыть'}
            </ActionButton>

            <ActionButton onClick={handlers.onDeleteGame} className="bg-accent-danger/20 text-accent-danger hover:bg-accent-danger/30">
                <TrashIcon className="w-5 h-5" /> Удалить
            </ActionButton>
        </div>
    );
}