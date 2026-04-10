import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold font-mono tracking-wide ${className}`}
    >
      {children}
    </span>
  );
}
