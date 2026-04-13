"use client";
import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    warning: (msg: string) => void;
    info: (msg: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue>({
  toast: { success: () => {}, error: () => {}, warning: () => {}, info: () => {} },
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useMemo(() => ({
    success: (msg: string) => addToast(msg, 'success'),
    error:   (msg: string) => addToast(msg, 'error'),
    warning: (msg: string) => addToast(msg, 'warning'),
    info:    (msg: string) => addToast(msg, 'info'),
  }), [addToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2 w-full max-w-sm pointer-events-none px-4 sm:px-0">
        {toasts.map(t => (
          <ToastBubble key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const CONFIG: Record<ToastType, { icon: React.ElementType; classes: string }> = {
  success: { icon: CheckCircle,   classes: 'bg-green-600 border-green-500/60' },
  error:   { icon: XCircle,       classes: 'bg-red-600 border-red-500/60' },
  warning: { icon: AlertTriangle, classes: 'bg-amber-500 border-amber-400/60' },
  info:    { icon: Info,          classes: 'bg-blue-600 border-blue-500/60' },
};

function ToastBubble({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const { icon: Icon, classes } = CONFIG[item.type];
  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-2xl border text-white toast-enter ${classes}`}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <p className="text-sm font-medium flex-1 leading-snug">{item.message}</p>
      <button
        onClick={onDismiss}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity mt-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
