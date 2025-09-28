import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

interface StarRatingProps {
  // Рейтинг для отображения (0-5)
  rating: number;
  // Сделаем callback опциональным. Если он не передан, компонент будет read-only.
  onRatingChange?: (rating: number) => void;
  // Добавим опциональный размер для иконок
  starSize?: 'small' | 'smallMedium' | 'medium' | 'large';
}

function StarRating({ rating, onRatingChange, starSize = 'medium' }: StarRatingProps) {
  // Состояние для отслеживания наведенной звезды. Будет работать только для интерактивной версии.
  const [hoverRating, setHoverRating] = useState(0);

  const handleRatingClick = (starValue: number) => {
    // Если onRatingChange не передан, клик ничего не делает.
    if (!onRatingChange) return;

    // Если кликаем на ту же звезду, сбрасываем рейтинг до 0.
    const newRating = starValue === rating ? 0 : starValue;
    onRatingChange(newRating);
  };

  const isInteractive = !!onRatingChange; // Проверяем, является ли компонент интерактивным

  const sizeClasses = {
    small: 'w-4 h-4',
    smallMedium: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((starValue) => (
        <StarIcon
          key={starValue}
          className={`
            ${sizeClasses[starSize]}
            ${isInteractive ? 'cursor-pointer' : ''}
            transition-colors duration-200
            ${
              (isInteractive && hoverRating ? hoverRating : rating) >= starValue
                ? 'text-yellow-400'
                : 'text-gray-600'
            }
            ${isInteractive && rating < starValue ? 'hover:text-yellow-300' : ''}
          `}
          // События вешаем только если компонент интерактивный
          onClick={isInteractive ? () => handleRatingClick(starValue) : undefined}
          onMouseEnter={isInteractive ? () => setHoverRating(starValue) : undefined}
          onMouseLeave={isInteractive ? () => setHoverRating(0) : undefined}
        />
      ))}
    </div>
  );
}

export default StarRating;