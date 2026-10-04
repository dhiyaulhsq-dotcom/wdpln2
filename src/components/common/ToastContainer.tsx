import React from 'react';
import { useWedding } from '../../context/WeddingContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useWedding();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-2">
      {toasts.map((toast) => {
        let bg = 'bg-white dark:bg-[#23211f] border-[#8A9A82]/30 text-[#2E2A27] dark:text-[#f3eee7]';
        let icon = <CheckCircle2 className="w-5 h-5 text-[#8A9A82] shrink-0" />;

        if (toast.type === 'error') {
          bg = 'bg-white dark:bg-[#23211f] border-rose-300 text-rose-900 dark:text-rose-200';
          icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
        } else if (toast.type === 'info') {
          bg = 'bg-white dark:bg-[#23211f] border-amber-300 text-amber-900 dark:text-amber-200';
          icon = <Info className="w-5 h-5 text-amber-500 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${bg}`}
          >
            <div className="flex items-center gap-3">
              {icon}
              <p className="text-sm font-medium leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors ml-2"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
