'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}

export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  placeholder = '••••••••',
  required,
  minLength,
}: PasswordInputProps): React.ReactElement {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 pr-10 rounded-lg bg-canvas-bg border border-panel-border
          text-sm text-gray-100 placeholder-gray-600
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500
          hover:text-gray-300 transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-r-lg"
      >
        {visible ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
      </button>
    </div>
  );
}
