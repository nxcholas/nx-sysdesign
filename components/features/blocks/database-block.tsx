interface DatabaseBlockProps {
  label?: string;
  size?: 'sm' | 'md';
}

export function DatabaseBlock({ label = 'Database', size = 'md' }: DatabaseBlockProps) {
  const containerClass = size === 'sm' ? 'w-8 h-8' : 'w-11 h-11';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Cylinder / database icon */}
      <div
        aria-hidden="true"
        className={`${containerClass} relative flex flex-col items-center`}
      >
        {/* Top ellipse */}
        <div className="w-full h-2 rounded-full bg-emerald-600 border border-emerald-400" />
        {/* Body */}
        <div className="w-full flex-1 bg-emerald-700 border-l border-r border-emerald-500" />
        {/* Middle line */}
        <div className="absolute top-1/2 w-full h-px bg-emerald-500 -translate-y-1/2" />
        {/* Bottom ellipse */}
        <div className="w-full h-2 rounded-full bg-emerald-600 border border-emerald-400" />
      </div>
      <span className={`${textSize} text-gray-300 font-mono text-center leading-tight`}>
        {label}
      </span>
    </div>
  );
}
