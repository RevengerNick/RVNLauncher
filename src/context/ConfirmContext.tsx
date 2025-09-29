import  { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { ConfirmModal } from '../components/ConfirmModal';

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  kind?: 'danger' | 'success';
}

type ConfirmContextType = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  
  const [resolveReject, setResolveReject] = useState<[(value: boolean) => void, (reason?: any) => void] | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve, reject) => {
      setOptions(options);
      setResolveReject([resolve, reject]);
    });
  }, []);

  const handleClose = () => {
    if (resolveReject) {
      resolveReject[0](false); 
    }
    setOptions(null);
  };

  const handleConfirm = () => {
    if (resolveReject) {
      resolveReject[0](true); 
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