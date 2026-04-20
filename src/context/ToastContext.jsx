import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ToastContext = React.createContext();

export const useToast = () => React.useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);

  const addToast = React.useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id));
    }, 4000); // Dissmiss after 4 seconds
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className="pointer-events-auto bg-slate-900 text-white pl-3 pr-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 ring-1 ring-white/10"
          >
            {t.type === 'success' && <CheckCircle2 className="text-emerald-400" size={20} />}
            {t.type === 'error' && <AlertCircle className="text-red-400" size={20} />}
            {t.type === 'info' && <Info className="text-blue-400" size={20} />}
            <p className="text-sm font-medium">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
