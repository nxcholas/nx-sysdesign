import React from 'react';

interface BrandLockupProps {
  showVersion?: boolean;
  className?: string;
}

export function BrandLockup({
  showVersion = true,
  className = '',
}: BrandLockupProps): React.ReactElement {
  return (
    <div className={`flex items-center gap-2 flex-shrink-0 ${className}`}>
      <div
        aria-hidden="true"
        className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="w-3.5 h-3.5"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>
      <span className="text-sm font-semibold text-gray-100 tracking-tight">
        SysDesign
      </span>
      {showVersion && (
        <span className="text-xs text-gray-600"> v{process.env.NEXT_PUBLIC_APP_VERSION}-beta</span>
      )}
    </div>
  );
}
