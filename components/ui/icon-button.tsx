import { type ReactNode, type ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  children: ReactNode;
}

export function IconButton({ children, className = '', ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center w-8 h-8 rounded text-gray-400 hover:text-gray-100 hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
