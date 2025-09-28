import  { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { ConfirmModal } from '../components/ConfirmModal';

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  kind?: 'danger' | 'success';
}

// Тип контекста: функция `confirm`, которая возвращает Promise<boolean>
type ConfirmContextType = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  
  // Создаем "обещание", которое мы будем разрешать или отклонять
  const [resolveReject, setResolveReject] = useState<[(value: boolean) => void, (reason?: any) => void] | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve, reject) => {
      setOptions(options);
      setResolveReject([resolve, reject]);
    });
  }, []);

  const handleClose = () => {
    if (resolveReject) {
      resolveReject[0](false); // Разрешаем Promise со значением `false` (отмена)
    }
    setOptions(null);
  };

  const handleConfirm = () => {
    if (resolveReject) {
      resolveReject[0](true); // Разрешаем Promise со значением `true` (подтверждение)
    }
    setOptions(null);
  };
  
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <ConfirmModal
          isOpen={!!options}
          onClose={handleClose}
          onConfirm={handleConfirm}
          {...options}
        />
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};