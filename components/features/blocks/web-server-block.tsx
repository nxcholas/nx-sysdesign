interface WebServerBlockProps {
  label?: string;
  size?: 'sm' | 'md';
}

export function WebServerBlock({ label = 'Web Server', size = 'md' }: WebServerBlockProps) {
  const iconSize = size === 'sm' ? 'w-8 h-6' : 'w-12 h-9';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Server rack icon */}
      <div
        aria-hidden="true"
        className={`${iconSize} rounded bg-indigo-700 border border-indigo-500 flex flex-col items-center justify-center gap-0.5 px-1`}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-full flex items-center gap-0.5">
            <div className="w-1 h-1 rounded-full bg-green-400" />
            <div className="flex-1 h-0.5 rounded bg-indigo-500" />
          </div>
        ))}
      </div>
      <span className={`${textSize} text-gray-300 font-mono text-center leading-tight`}>
        {label}
      </span>
    </div>
  );
}
