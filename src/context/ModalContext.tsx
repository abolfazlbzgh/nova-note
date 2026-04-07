'use client';

import React, {createContext, useContext, useState, useCallback, ReactNode} from 'react';
import {GlobalModal} from '@/components/ui/GlobalModal';

export interface ModalAction {
  label: string;
  onClick: () => void | Promise<void>;
  className?: string;
}

export interface ModalOptions {
  title: string;
  body?: ReactNode;

  type?: 'default' | 'info' | 'success' | 'warning' | 'error';

  actions?: ModalAction[];

  hideIcon?: boolean;
  icon?: ReactNode;

  preventClose?: boolean;
}

interface ModalContextType {
  isOpen: boolean;
  options: ModalOptions | null;
  showModal: (opts: ModalOptions) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({children}: {children: ReactNode}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions | null>(null);

  const showModal = useCallback((opts: ModalOptions) => {
    setOptions(opts);
    setIsOpen(true);
    // Lock scroll to prevent background moving
    document.body.style.overflow = 'hidden';
  }, []);

  const hideModal = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = '';
    setTimeout(() => setOptions(null), 300);
  }, []);

  return (
    <ModalContext.Provider value={{isOpen, options, showModal, hideModal}}>
      {children}
      <GlobalModal isOpen={isOpen} options={options} onClose={hideModal} />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within a ModalProvider');
  return context;
};
