interface UserBlockProps {
  label?: string;
  size?: 'sm' | 'md';
}

export function UserBlock({ label = 'User', size = 'md' }: UserBlockProps) {
  const iconSize = size === 'sm' ? 'w-7 h-7' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* User icon */}
      <div
        aria-hidden="true"
        className={`${iconSize} rounded-full bg-blue-600 flex items-center justify-center text-white`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3/5 h-3/5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <span className={`${textSize} text-gray-300 font-mono text-center leading-tight`}>
        {label}
      </span>
    </div>
  );
}
