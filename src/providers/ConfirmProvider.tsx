'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmContextType {
  openConfirm: (options: ConfirmOptions) => Promise<boolean>;
  showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning') => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [dialog, setDialog] = useState<(ConfirmOptions & { resolve: (val: boolean) => void }) | null>(null);

  const openConfirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialog({ ...options, resolve });
    });
  }, []);

  const showAlert = useCallback((title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    return new Promise<void>((resolve) => {
      setDialog({ 
        title, 
        message, 
        type: type === 'warning' ? 'warning' : 'info', 
        confirmText: 'OK', 
        cancelText: '', 
        resolve: () => resolve() 
      });
    });
  }, []);

  const handleClose = (value: boolean) => {
    if (dialog) {
      dialog.resolve(value);
      setDialog(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ openConfirm, showAlert }}>
      {children}
      <AnimatePresence>
        {dialog && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm glass-card overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-2xl ${
                    dialog.type === 'danger' ? 'bg-red-500/20 text-red-500' :
                    dialog.type === 'warning' ? 'bg-amber-500/20 text-amber-500' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {dialog.type === 'danger' ? <AlertTriangle className="w-6 h-6" /> :
                     dialog.type === 'warning' ? <AlertTriangle className="w-6 h-6" /> :
                     <Info className="w-6 h-6" />}
                  </div>
                  <h3 className="text-xl font-bold">{dialog.title}</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                  {dialog.message}
                </p>
                <div className="flex gap-3">
                  {dialog.cancelText !== '' && (
                    <button
                      onClick={() => handleClose(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all"
                    >
                      {dialog.cancelText || 'Cancel'}
                    </button>
                  )}
                  <button
                    onClick={() => handleClose(true)}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/10 ${
                      dialog.type === 'danger' ? 'bg-red-500 hover:bg-red-400 text-white' :
                      'bg-emerald-500 hover:bg-emerald-400 text-black'
                    }`}
                  >
                    {dialog.confirmText || 'Confirm'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
};
