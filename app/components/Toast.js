'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);

    // Auto-remover después de la duración
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Métodos de conveniencia
  const success = useCallback((message, duration) => showToast(message, 'success', duration), [showToast]);
  const error = useCallback((message, duration) => showToast(message, 'error', duration), [showToast]);
  const warning = useCallback((message, duration) => showToast(message, 'warning', duration), [showToast]);
  const info = useCallback((message, duration) => showToast(message, 'info', duration), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }) {
  const { message, type } = toast;

  const styles = {
    success: {
      bg: 'bg-green-50 border-green-500',
      icon: '✓',
      iconBg: 'bg-green-500',
      text: 'text-green-800'
    },
    error: {
      bg: 'bg-red-50 border-red-500',
      icon: '✕',
      iconBg: 'bg-red-500',
      text: 'text-red-800'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-500',
      icon: '⚠',
      iconBg: 'bg-yellow-500',
      text: 'text-yellow-800'
    },
    info: {
      bg: 'bg-blue-50 border-blue-500',
      icon: 'ℹ',
      iconBg: 'bg-blue-500',
      text: 'text-blue-800'
    }
  };

  const style = styles[type] || styles.info;

  return (
    <div 
      className={`${style.bg} border-l-4 rounded-lg shadow-lg p-4 min-w-[320px] max-w-md pointer-events-auto animate-slide-in-right`}
    >
      <div className="flex items-start gap-3">
        <div className={`${style.iconBg} text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold`}>
          {style.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`${style.text} text-sm font-medium break-words`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`${style.text} hover:opacity-70 transition flex-shrink-0 ml-2`}
          aria-label="Cerrar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
