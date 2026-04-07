'use client';

import React from 'react';
import {ModalOptions} from '@/context/ModalContext';
import {AlertTriangle, CheckCircle, Info, X, Trash2} from 'lucide-react';

interface GlobalModalProps {
  isOpen: boolean;
  options: ModalOptions | null;
  onClose: () => void;
}

export const GlobalModal: React.FC<GlobalModalProps> = ({isOpen, options, onClose}) => {
  if (!options) return null;

  const handleBackdropClick = () => {
    if (options.preventClose) return;
    onClose();
  };

  const getIcon = () => {
    if (options.hideIcon) return null;
    if (options.icon) return <div className="shrink-0">{options.icon}</div>;

    const iconClass = 'w-6 h-6 shrink-0';
    switch (options.type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-success`} />;
      case 'error':
        return <Trash2 className={`${iconClass} text-error`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-warning`} />;
      case 'info':
        return <Info className={`${iconClass} text-info`} />;
      default:
        return null;
    }
  };

  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''} modal-bottom sm:modal-middle backdrop-blur-sm`}>
      <div className="modal-box overflow-hidden rounded-t-2xl p-0 shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="relative flex flex-col items-start gap-3 px-6 pt-6 pb-2">
          {!options.preventClose && (
            <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute top-4 right-4 z-10">
              <X className="h-5 w-5" />
            </button>
          )}

          <div className="flex w-full items-center gap-3 pr-8">
            {getIcon()}
            <h3 className="text-lg leading-tight font-bold break-words sm:text-xl">{options.title}</h3>
          </div>
        </div>

        {/* Body */}
        <div className="text-base-content/70 px-6 py-2 text-sm leading-relaxed sm:text-base">{options.body}</div>

        {/* Actions */}
        {options.actions && options.actions.length > 0 && (
          <div className="bg-base-200/50 mt-4 flex flex-col-reverse gap-3 px-6 py-4 sm:flex-row sm:justify-end">
            {options.actions.map((action, index) => (
              <button
                key={index}
                onClick={async () => {
                  await action.onClick();
                }}
                className={`btn btn-sm sm:btn-md w-full min-w-[100px] sm:w-auto ${action.className || 'btn-neutral'}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={handleBackdropClick} className="cursor-default">
          close
        </button>
      </form>
    </div>
  );
};
