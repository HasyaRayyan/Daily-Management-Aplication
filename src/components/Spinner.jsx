export default function Spinner({ size = 'md', className = '' }) {
  const dim = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-12 h-12';
  
  return (
    <div className={`relative flex items-center justify-center ${dim} ${className} shrink-0`}>
      <svg className="w-full h-full" viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          className="stroke-brand-200 dark:stroke-brand-800"
          strokeWidth="4"
        />
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          className="stroke-brand-950 dark:stroke-white"
          strokeWidth="4"
          strokeDasharray="75"
          strokeDashoffset="50"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 25 25"
            to="360 25 25"
            dur="0.75s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
}
