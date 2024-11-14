import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Toast {
  id: number;
  message: string;
  type: 'error' | 'success' | 'info';
}

let toastCount = 0;
const toastEventTarget = new EventTarget();

export const toast = {
  error: (message: string) => {
    const event = new CustomEvent('toast', {
      detail: { message, type: 'error', id: ++toastCount }
    });
    toastEventTarget.dispatchEvent(event);
  },
  success: (message: string) => {
    const event = new CustomEvent('toast', {
      detail: { message, type: 'success', id: ++toastCount }
    });
    toastEventTarget.dispatchEvent(event);
  },
  info: (message: string) => {
    const event = new CustomEvent('toast', {
      detail: { message, type: 'info', id: ++toastCount }
    });
    toastEventTarget.dispatchEvent(event);
  }
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const { detail } = event as CustomEvent;
      setToasts(prev => [...prev, detail]);
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== detail.id));
      }, 5000);
    };

    toastEventTarget.addEventListener('toast', handleToast);
    return () => toastEventTarget.removeEventListener('toast', handleToast);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg flex items-center gap-2 ${
            toast.type === 'error' ? 'bg-red-500 text-white' :
            toast.type === 'success' ? 'bg-green-500 text-white' :
            'bg-blue-500 text-white'
          }`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            className="p-1 hover:bg-white/10 rounded"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}