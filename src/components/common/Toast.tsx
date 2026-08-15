import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useShop();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl glass-card border-l-4 border-l-[#FF6F61] shadow-2xl bg-zinc-950/90 text-white"
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-[#FF6F61]" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white leading-snug">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{toast.description}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
