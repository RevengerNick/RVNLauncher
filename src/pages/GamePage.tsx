import { useGameDetails } from '../hooks/useGameDetails';
import { useNavigate } from 'react-router-dom';
import { deleteGame } from '../utils/db'; // Для удаления игры
import { GamePageHeader } from '../components/GamePage/Header';
import { GamePageActions } from '../components/GamePage/Actions';
import { GamePageTabs } from '../components/GamePageTabs';
import { GameMetadata } from '../components/GameMetadata';
import { GameSavesManager } from '../components/GameSavesManager';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';

export function GamePage() {
  const navigate = useNavigate();
  const gamePath = useParams<{ gamePath: string }>().gamePath;
  
  const {
    game,
    loading,
    iconDataUrl,
    iconOrientation,
    gameFolderIds,
    setGameFolderIds,
    handleSetIcon,
    handlePasteIcon,
    handleRatingChange,
    handleToggleHidden,
    handleOpenFolder,
    saveName,
    saveVersion,
    saveDescription,
    handleDeleteIcon
  } = useGameDetails(gamePath);

  const handleDeleteGame = async () => {
    if (game && window.confirm(`Вы уверены, что хотите удалить игру "${game.name}" из библиотеки?`)) {
      await deleteGame(game.path);
      navigate('/');
    }
  };

  

  if (loading) {
    return (
        <div className="flex items-center justify-center h-full">
            <p>Загрузка...</p>
        </div>
    );
  }
  
  if (!game) {
    return <div className="p-10">Игра не найдена.</div>;
  }
  
  const tabs = [
    {
      title: 'Обзор',
      content: (
        <GameMetadata 
          game={game}
          onDescriptionChange={saveDescription}
          onVersionChange={saveVersion}
        />
      ),
    },
    {
      title: 'Сохранения',
      content: <GameSavesManager game={game} />,
    },
  ];

  return (
    <motion.div 
      className="px-4 sm:px-10 lg:px-20 flex flex-1 justify-center py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col max-w-4xl mx-auto flex-1"> {/* Центрируем и ограничиваем ширину */}
        <GamePageHeader
          game={game}
          iconDataUrl={iconDataUrl}
          iconOrientation={iconOrientation}
          onIconChange={handleSetIcon}
          onPasteIcon={handlePasteIcon} // Передаем
          onDeleteIcon={handleDeleteIcon}
          onRatingChange={handleRatingChange} // Передаем
          onNameChange={saveName}
        />
        
        <GamePageActions 
            game={game}
            gameFolderIds={gameFolderIds}
            setGameFolderIds={setGameFolderIds}
            handlers={{
                onOpenFolder: handleOpenFolder,
                onToggleHidden: handleToggleHidden,
                onDeleteGame: handleDeleteGame,
            }}
        />

        <div className="pb-3">
          <GamePageTabs tabs={tabs} />
        </div>
      </div>
    </motion.div>
  );
}

export default GamePage;