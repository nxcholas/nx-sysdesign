'use client';

import { useRef, useCallback, useEffect } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  state?: 'idle' | 'error' | 'success';
  autoFocus?: boolean;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  state = 'idle',
  autoFocus = false,
}: OtpInputProps) {
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  const focusIndex = useCallback((index: number) => {
    const el = inputRefs.current[Math.max(0, Math.min(index, length - 1))];
    el?.focus();
    el?.select();
  }, [length]);

  const handleChange = useCallback((index: number, char: string) => {
    const digit = char.replace(/\D/g, '').slice(-1);
    const next = digits.map((d, i) => (i === index ? digit : d));
    const newValue = next.join('');
    onChange(newValue);
    if (digit && index < length - 1) {
      focusIndex(index + 1);
    }
  }, [digits, length, onChange, focusIndex]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[index]) {
        const next = digits.map((d, i) => (i === index ? '' : d));
        onChange(next.join(''));
      } else if (index > 0) {
        const next = digits.map((d, i) => (i === index - 1 ? '' : d));
        onChange(next.join(''));
        focusIndex(index - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusIndex(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusIndex(index + 1);
    }
  }, [digits, onChange, focusIndex]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const next = Array.from({ length }, (_, i) => pasted[i] ?? '');
    onChange(next.join(''));
    focusIndex(Math.min(pasted.length, length - 1));
  }, [length, onChange, focusIndex]);

  const borderClass =
    state === 'error'
      ? 'border-red-500 focus:ring-red-500'
      : state === 'success'
      ? 'border-green-500 focus:ring-green-500'
      : 'border-panel-border focus:ring-blue-500';

  const animationClass = state === 'error' ? 'animate-otp-shake' : '';

  return (
    <div
      className={`flex items-center gap-2 ${animationClass}`}
      onPaste={handlePaste}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${length}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-12 text-center text-lg font-mono rounded-lg
            bg-canvas-bg border ${borderClass}
            text-gray-100 caret-transparent
            focus:outline-none focus:ring-2 focus:border-transparent
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors duration-150`}
        />
      ))}
    </div>
  );
}
