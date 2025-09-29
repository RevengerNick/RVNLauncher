import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  starSize?: 'small' | 'smallMedium' | 'medium' | 'large';
}

function StarRating({ rating, onRatingChange, starSize = 'medium' }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleRatingClick = (starValue: number) => {
    if (!onRatingChange) return;

    const newRating = starValue === rating ? 0 : starValue;
    onRatingChange(newRating);
  };

  const isInteractive = !!onRatingChange;

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
          onClick={isInteractive ? () => handleRatingClick(starValue) : undefined}
          onMouseEnter={isInteractive ? () => setHoverRating(starValue) : undefined}
          onMouseLeave={isInteractive ? () => setHoverRating(0) : undefined}
        />
      ))}
    </div>
  );
}

export default StarRating;