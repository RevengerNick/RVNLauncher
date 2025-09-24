import { useGameDetails } from '../hooks/useGameDetails';
import { GameHeader } from '../components/GameHeader';
import { GameActions } from '../components/GameActions';
import { GameMetadata } from '../components/GameMetadata';
import { GameSavesManager } from '../components/GameSavesManager';
import { deleteGame } from '../utils/db'; // Для удаления игры (если решишь добавить)
import { useNavigate } from 'react-router-dom';


function GamePage() {
  const navigate = useNavigate();
  
  // Вся сложная логика теперь здесь
  const {
    game,
    loading,
    iconDataUrl,
    gameFolderIds,
    setGameFolderIds,
    handleSetIcon,
    handleRatingChange,
    handleToggleHidden,
    handleOpenFolder,
    saveName,
    saveVersion,
    saveDescription
  } = useGameDetails();

  if (loading) {
    return <div>Загрузка...</div>;
  }
  
  if (!game) {
    return <div>Игра не найдена.</div>;
  }

  const handleDeleteGame = async (gamePath: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту игру из библиотеки?')) {
      await deleteGame(gamePath); 
      navigate('/'); 
    }
  };

  return (
    <div>
      <GameHeader
        game={game}
        iconDataUrl={iconDataUrl}
        onIconChange={handleSetIcon}
        onRatingChange={handleRatingChange}
        onNameChange={saveName}
        onToggleHidden={handleToggleHidden}
        onDeleteGame={handleDeleteGame}
      />
      
      <GameActions
        gamePath={game.path}
        onOpenFolder={handleOpenFolder}
        initialFolderIds={gameFolderIds}
        onFoldersChange={setGameFolderIds}
      />

      <GameMetadata 
        game={game}
        onDescriptionChange={saveDescription}
        onVersionChange={saveVersion}
      />

      <GameSavesManager game={game} />
    </div>
  );
}

export default GamePage;