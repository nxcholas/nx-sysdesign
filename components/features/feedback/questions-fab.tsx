'use client';

import { useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircleQuestion } from 'lucide-react';
import { QuestionsModal } from './questions-modal';

const ALLOWED_PATHS = new Set<string>([
  '/',
  '/changelog',
  '/sign-in',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email-required',
]);

function shouldRender(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname.startsWith('/canvas')) return false;
  return ALLOWED_PATHS.has(pathname);
}

export function QuestionsFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  if (!shouldRender(pathname)) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Ask a question"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 inline-flex items-center justify-center gap-2 h-11 sm:px-4 w-11 sm:w-auto rounded-full bg-[#111318] border border-[#2a2d35] hover:border-gray-500 text-gray-100 shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas-bg motion-safe:active:scale-[0.98] cursor-pointer"
      >
        <MessageCircleQuestion size={18} aria-hidden="true" />
        <span className="hidden sm:inline text-sm font-medium">Questions</span>
      </button>
      {open && (
        <QuestionsModal
          onClose={() => setOpen(false)}
          returnFocusRef={triggerRef}
        />
      )}
    </>
  );
}
