export default function Header({ title, onBack }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <button 
        onClick={onBack} 
        className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shrink-0 shadow-md"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>
      <h2 className="text-2xl font-black tracking-tight">{title}</h2>
    </div>
  );
}
