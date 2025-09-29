import { Link } from 'react-router-dom';
import { GameEntry } from '../utils/db';
import { formatGameName } from '../utils/formatters';
import { generateGradientColors } from '../utils/gradient-generator';
import StarRating from './StarRating';
import { convertFileSrc } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';

interface PosterGameCardProps {
  game: GameEntry;
  iconUrl: string | undefined;
  aspectRatio: string;
}

const ratioMap: Record<string, string> = {
    '2/3': 'aspect-[2/3]',
    '3/4': 'aspect-[3/4]',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-[1/1]',
    '16/9': 'aspect-[16/9]',
    '9/16': 'aspect-[9/16]',
};

export function PosterGameCard({ game, iconUrl, aspectRatio }: PosterGameCardProps) {
    const encodedPath = encodeURIComponent(game.path);
    const [gradientStyle, setGradientStyle] = useState({});
    useEffect(() => {
        const { color1, color2 } = generateGradientColors(game.name);
        setGradientStyle({ backgroundImage: `linear-gradient(to top, black, ${color1}, ${color2}, transparent 95%)` });
    }, []);
    //const aspectClass = `aspect-[${aspectRatio.replace('/', '/')}]`;

    return (
        <Link to={`/game/${encodedPath}`} className={"block relative bg-primary " + ratioMap[aspectRatio] + " rounded-2xl overflow-hidden hover:scale-115 transition-all duration-200 shadow-md group"}>
            {iconUrl ? (
                <div>
                    <img
                        src={convertFileSrc(iconUrl || '')}
                        alt={game.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{
                        WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1)80%, rgba(0,0,0,0)95%)",
                        WebkitMaskRepeat: "no-repeat",
                        WebkitMaskSize: "100% 100%",
                        maskImage: "linear-gradient(to top, rgba(0,0,0,1)80%, rgba(0,0,0,0)95%)",
                        maskRepeat: "no-repeat",
                        maskSize: "100% 100%",
                        }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/70  to-transparent`}></div>
                </div>
            ) : (
                <div className="h-1/2 flex items-center justify-center">
                    <div className="w-full h-full flex items-center justify-center text-text-primary">Нет постера</div>
                    <div className={`absolute inset-0 `} style={gradientStyle}></div>
                </div>
            )}
            {/* Градиент и название */}
            
            <div className="absolute bottom-4 left-4 right-4 font-bold text-white text-lg truncate">
                <h3>{formatGameName(game.name)}</h3>
                {game.rating > 0 && (
                        <div className="mt-1">
                            <StarRating rating={game.rating} starSize="small" />
                        </div>
                    )}
                <p className="text-gray-400 text-xs">{game.version}</p>
            </div>   
        </Link>
    );
}