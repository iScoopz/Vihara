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

      {/* Floating Toast Container */}
      <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none print:hidden">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
                isSuccess
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100 dark:bg-emerald-950/95'
                  : isError
                  ? 'bg-rose-950/90 border-rose-500/50 text-rose-100 dark:bg-rose-950/95'
                  : 'bg-purple-950/90 border-purple-500/50 text-purple-100 dark:bg-purple-950/95'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isError ? (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                ) : (
                  <Info className="w-5 h-5 text-purple-400" />
                )}
              </div>

              <div className="flex-1 space-y-0.5">
                <h5 className="text-xs font-black uppercase tracking-wide">
                  {toast.title || (isSuccess ? 'Berhasil' : isError ? 'Pemberitahuan System' : 'Informasi')}
                </h5>
                <p className="text-xs font-semibold leading-relaxed opacity-90">{toast.message}</p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X size={14} />
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
      showToast: (message: string, type: ToastType = 'info') => {
        if (type === 'error') alert(`⚠️ ${message}`);
        else if (type === 'success') alert(`✓ ${message}`);
        else alert(`ℹ️ ${message}`);
      }
    };
  }
  return context;
};
