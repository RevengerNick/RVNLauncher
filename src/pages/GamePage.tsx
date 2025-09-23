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
    // Это состояние должно быть обработано в useGameDetails, если игра не найдена
    return <div>Игра не найдена.</div>;
  }

  // Функция для удаления игры (можно добавить в GameHeader или отдельную кнопку)
  const handleDeleteGame = async (gamePath: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту игру из библиотеки?')) {
      await deleteGame(gamePath); // Вызываем команду удаления из БД
      navigate('/'); // Перенаправляем на главную страницу после удаления
    }
  };

  return (
    <div>
      {/* Заголовок с иконкой, названием, рейтингом и кнопками скрытия/удаления */}
      <GameHeader
        game={game}
        iconDataUrl={iconDataUrl}
        onIconChange={handleSetIcon}
        onRatingChange={handleRatingChange}
        onNameChange={saveName}
        onToggleHidden={handleToggleHidden}
        onDeleteGame={handleDeleteGame} // Передаем функцию удаления
      />
      
      {/* Кнопки действий: Играть, Управление папками, Открыть папку */}
      <GameActions
        gamePath={game.path}
        onOpenFolder={handleOpenFolder}
        initialFolderIds={gameFolderIds}
        onFoldersChange={setGameFolderIds}
      />

      {/* Блок с описанием и версией */}
      <GameMetadata 
        game={game}
        onDescriptionChange={saveDescription}
        onVersionChange={saveVersion}
      />

      {/* Блок управления сохранениями */}
      <GameSavesManager game={game} />
    </div>
  );
}

export default GamePage;