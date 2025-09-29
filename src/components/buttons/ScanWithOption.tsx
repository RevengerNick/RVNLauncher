import { useState } from 'react';
import { PlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useDebouncedCallback } from 'use-debounce';

interface ScanButtonWithOptionProps {
  onScan: (isFullScan: boolean) => void;
  isScanning: boolean;
  isFullScan: boolean;
  setIsFullScan: (isFullScan: boolean) => void;
}

export function ScanButtonWithOption({ onScan, isScanning, isFullScan, setIsFullScan }: ScanButtonWithOptionProps) {
  const [isFullScanHover, setIsFullScanHover] = useState(false);

  const debouncedScan = useDebouncedCallback(() => {
    onScan(isFullScan);
  }, 300);

  return (
    <div className="flex items-stretch rounded-full shadow-lg bg-blue-600/50 transition-colors">
      
      <button 
        onClick={() => debouncedScan()} 
        disabled={isScanning}
        className="bg-blue-600 hover:bg-accent-primary text-white font-bold py-2 px-4 rounded-tl-full rounded-bl-full flex items-center gap-2 disabled:bg-gray-500 transition-colors"
      >
        <PlusIcon className="w-5 h-5" />
        <span>{isScanning ? 'Сканирование...' : 'Импорт игр'}</span>
      </button>

      <div 
        className={`relative flex items-center justify-center p-1.5 transition-colors cursor-pointer text-white 
          ${isScanning ? 'opacity-70 pointer-events-none' : ''}
        `}
        onClick={() => setIsFullScan(!isFullScan)}
        onMouseEnter={() => setIsFullScanHover(true)}
        onMouseLeave={() => setIsFullScanHover(false)}
      >
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors 
            ${isFullScan 
              ? 'border-green-500 bg-green-500/20' 
              : 'border-white/50 hover:border-white/90' 
            }`}
        >
          <CheckCircleIcon className={`w-4 h-4 transition-colors 
              ${isFullScan ? 'text-green-500' : 'text-text-primary/50'}`} />
        </div>
        {isFullScanHover && (
            <div className="absolute z-10 top-full mt-2 p-2 text-xs text-text-primary bg-primary rounded-md whitespace-nowrap">
                {isFullScan ? 'Полный поиск (вкл)' : 'Частичный поиск (выкл)'}
            </div>
        )}
      </div>
    </div>
  );
}