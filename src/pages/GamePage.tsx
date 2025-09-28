import { useGameDetails } from '../hooks/useGameDetails';
import { GameHeader } from '../components/GameHeader';
import { GameMetadata } from '../components/GameMetadata';
import { GameSavesManager } from '../components/GameSavesManager';
import { GamePageTabs } from '../components/GamePageTabs'; // Наш новый компонент
import { deleteGame } from '../utils/db';
import { useNavigate } from 'react-router-dom';

function GamePage() {
  const navigate = useNavigate();
  
  
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
    handlePasteIcon,
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

  // --- ГОТОВИМ ДАННЫЕ ДЛЯ ТАБОВ ---
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
    // Можно добавить таб для настроек в будущем
    // {
    //   title: 'Настройки',
    //   content: <div>Здесь будут настройки запуска.</div>,
    // },
  ];

  return (
    <div>
      <GameHeader
        game={game}
        iconDataUrl={iconDataUrl}
        gameFolderIds={gameFolderIds}
        setGameFolderIds={setGameFolderIds}
        onIconChange={handleSetIcon}
        onPasteIcon={handlePasteIcon}
        onRatingChange={handleRatingChange}
        onNameChange={saveName}
        onToggleHidden={handleToggleHidden}
        onOpenFolder={handleOpenFolder}
        onDeleteGame={handleDeleteGame}
      />

      {/* --- ТАБЫ С ОСТАЛЬНОЙ ИНФОРМАЦИЕЙ --- */}
      <div className="mt-8">
        <GamePageTabs tabs={tabs} />
      </div>
    </div>
  );
}

export default GamePage;