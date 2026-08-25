import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in bg-black/40 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="w-full sm:max-w-md bg-brand-50/95 dark:bg-brand-950/95 backdrop-blur-2xl rounded-t-[2rem] sm:rounded-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-10 flex flex-col max-h-[90vh] animate-slide-up border border-white/50 dark:border-brand-800/50">
        
        <div className="flex justify-between items-center px-6 py-5 border-b border-brand-200/50 dark:border-brand-800/50 shrink-0">
          <h3 className="font-black text-lg tracking-tight text-brand-950 dark:text-white">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-brand-200/50 dark:bg-brand-800/50 rounded-full hover:bg-brand-300 dark:hover:bg-brand-700 text-brand-900 dark:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto scroll-smooth">
          {children}
        </div>
        
      </div>
    </div>
  );
}
