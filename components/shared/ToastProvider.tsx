import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Toast, ToastMessage, ToastType } from './Toast';

type ToastContextValue = {
  show: (input: { type?: ToastType; title: string; message?: string }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const show = useCallback(
    (input: { type?: ToastType; title: string; message?: string }) => {
      setToast({ type: input.type ?? 'info', title: input.title, message: input.message });
    },
    [],
  );

  const success = useCallback((title: string, message?: string) => show({ type: 'success', title, message }), [show]);
  const error = useCallback((title: string, message?: string) => show({ type: 'error', title, message }), [show]);

  const value = useMemo(() => ({ show, success, error }), [show, success, error]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

