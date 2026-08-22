export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in" 
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-lg bg-white dark:bg-brand-950 rounded-t-3xl sm:rounded-2xl p-6 pb-12 sm:pb-6 shadow-2xl animate-slide-up border-t sm:border border-brand-100 dark:border-brand-800">
        <div className="w-12 h-1.5 bg-brand-200 dark:bg-brand-800 rounded-full mx-auto mb-6 sm:hidden" />
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-extrabold">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-800">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
