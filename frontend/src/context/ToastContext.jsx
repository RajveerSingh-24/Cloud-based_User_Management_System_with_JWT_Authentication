import React, { createContext, useState, useContext, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const handleGlobalToast = (event) => {
      const { message, type, duration } = event.detail;
      addToast(message, type, duration);
    };
    window.addEventListener('show-toast', handleGlobalToast);
    return () => window.removeEventListener('show-toast', handleGlobalToast);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} color="#22c55e" />;
      case 'error':
        return <AlertCircle size={18} color="#ef4444" />;
      case 'info':
      default:
        return <Info size={18} color="var(--accent-primary)" />;
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {getIcon(toast.type)}
            <span style={{ fontSize: '0.9rem', fontWeight: 500, flex: 1 }}>{toast.message}</span>
            <button 
              onClick={() => removeToast(toast.id)} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
