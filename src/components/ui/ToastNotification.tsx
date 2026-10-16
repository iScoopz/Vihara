'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { id, type, title, message };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div aria-live="polite" className="fixed bottom-[calc(88px+env(safe-area-inset-bottom))] left-4 right-4 sm:left-auto sm:bottom-auto sm:top-4 z-[99999] flex flex-col gap-2 sm:max-w-sm sm:w-full pointer-events-none print:hidden">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const Icon = isSuccess ? CheckCircle2 : isError ? AlertTriangle : Info;

          return (
            <div
              key={toast.id}
              role={isError ? 'alert' : 'status'}
              className="pointer-events-auto pl-4 pr-1 py-2 rounded-xl shadow-lg border border-line bg-surface text-ink flex items-start gap-3"
            >
              <Icon size={18} aria-hidden className={`shrink-0 mt-1.5 ${isSuccess ? 'text-ok' : isError ? 'text-danger' : 'text-brand-ink'}`} />
              <div className="flex-1 py-1 min-w-0">
                {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
                <p className="text-sm text-ink-2 break-words">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Tutup notifikasi"
                className="shrink-0 w-11 h-11 sm:w-9 sm:h-9 inline-flex items-center justify-center rounded-lg text-ink-3 hover:text-ink hover:bg-surface-2 cursor-pointer"
              >
                <X size={16} aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside ToastProvider
    return {
      showToast: (message: string) => alert(message)
    };
  }
  return context;
};
