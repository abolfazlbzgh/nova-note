'use client';

import {useToast, Toast, ToastType} from '@/context/ToastContext';
import {CheckCircle, AlertTriangle, Info, XCircle, X} from 'lucide-react';
import {useEffect, useState} from 'react';

export default function ToastContainer() {
  const {toasts, removeToast} = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-0 bottom-0 z-50 flex flex-col items-end gap-2 p-4 md:top-14 md:bottom-auto">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

const ToastItem = ({toast, onRemove}: {toast: Toast; onRemove: (id: string) => void}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getAlertClass = (type: ToastType) => {
    switch (type) {
      case ToastType.SUCCESS:
        return 'alert-success ';
      case ToastType.ERROR:
        return 'alert-error ';
      case ToastType.WARNING:
        return 'alert-warning';
      case ToastType.INFO:
        return 'alert-info ';
      default:
        return 'alert-info';
    }
  };
  const iconClass = 'w-5 h-5 md:w-6 md:h-6 shrink-0';

  const getIcon = (type: ToastType) => {
    switch (type) {
      case ToastType.SUCCESS:
        return <CheckCircle className={iconClass} />;
      case ToastType.ERROR:
        return <XCircle className={iconClass} />;
      case ToastType.WARNING:
        return <AlertTriangle className={iconClass} />;
      case ToastType.INFO:
        return <Info className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  return (
    <div
      className={`alert ${getAlertClass(toast.type)} pointer-events-auto flex w-auto max-w-sm min-w-[300px] transform items-start justify-between shadow-lg transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
      }`}
      role="alert"
    >
      <div className="flex items-center gap-3">
        {getIcon(toast.type)}
        <span className="text-left text-sm leading-tight font-medium break-words md:text-base md:leading-normal">
          {toast.message}
        </span>
      </div>
      <button onClick={handleClose} className="btn btn-ghost btn-xs btn-circle shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
