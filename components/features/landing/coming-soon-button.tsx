'use client';

import React from 'react';

interface ComingSoonButtonProps {
  variant: 'primary' | 'ghost';
  children: React.ReactNode;
  srLabel?: string;
  fullWidth?: boolean;
}

const base =
  'inline-flex items-center justify-center h-11 px-5 rounded-md text-sm font-medium transition-colors cursor-not-allowed opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas-bg';

const variants = {
  primary: 'bg-blue-600 text-white',
  ghost: 'border border-panel-border text-gray-200',
};

export function ComingSoonButton({
  variant,
  children,
  srLabel = 'Coming soon — authentication is not yet available',
  fullWidth,
}: ComingSoonButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      aria-disabled="true"
      title="Coming soon"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''}`}
    >
      {children}
      <span className="sr-only"> ({srLabel})</span>
    </button>
  );
}
