'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { CheckCircle2, Loader2, X } from 'lucide-react';

interface QuestionsModalProps {
  onClose: () => void;
  /** Element to return focus to when closed. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

const MAX_MESSAGE = 4000;
const MAX_NAME = 120;
const MAX_EMAIL = 254;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function QuestionsModal({ onClose, returnFocusRef }: QuestionsModalProps) {
  const titleId = useId();
  const descId = useId();
  const nameId = useId();
  const emailId = useId();
  const messageId = useId();
  const errorId = useId();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus the message field on open and trap focus.
  useEffect(() => {
    messageRef.current?.focus();
  }, []);

  // Escape + focus return on unmount.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const returnTarget = returnFocusRef?.current ?? null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const nodes = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter((n) => !n.hasAttribute('disabled'));
        if (nodes.length === 0) return;
        const first = nodes[0]!;
        const last = nodes[nodes.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      const target = returnTarget ?? previouslyFocused;
      target?.focus?.();
    };
  }, [onClose, returnFocusRef]);

  // Auto-close on success.
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => onClose(), 2000);
    return () => clearTimeout(t);
  }, [success, onClose]);

  const trimmedMessage = message.trim();
  const submitDisabled = submitting || rateLimited || trimmedMessage.length === 0;
  const nearLimit = message.length >= MAX_MESSAGE * 0.9;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitDisabled) return;
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          message: trimmedMessage,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        return;
      }
      let errMsg = 'Something went wrong. Please try again.';
      try {
        const data = (await res.json()) as { error?: string };
        if (data?.error) errMsg = data.error;
      } catch {
        /* ignore */
      }
      if (res.status === 429) setRateLimited(true);
      setServerError(errMsg);
    } catch {
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative w-full max-w-md bg-[#111318] border border-[#2a2d35] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-gray-100">
              Ask a question
            </h2>
            <p id={descId} className="text-sm text-gray-400 mt-0.5">
              We typically reply within a few business days.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors rounded p-1 -m-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="px-6 pb-6 pt-2 flex flex-col items-center text-center gap-3">
            <CheckCircle2 size={40} className="text-emerald-400" aria-hidden="true" />
            <p className="text-sm text-gray-200">Thanks — we&apos;ll get back to you.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 h-9 px-4 rounded-lg border border-[#2a2d35] hover:border-gray-500 text-sm text-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 pb-6 flex flex-col gap-3" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor={nameId} className="text-xs font-medium text-gray-300">
                  Name <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  id={nameId}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={MAX_NAME}
                  readOnly={submitting}
                  autoComplete="name"
                  className="h-10 px-3 rounded-xl bg-[#0d0f14] border border-[#2a2d35] text-sm text-gray-100 placeholder:text-gray-600 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor={emailId} className="text-xs font-medium text-gray-300">
                  Email <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  id={emailId}
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={MAX_EMAIL}
                  readOnly={submitting}
                  autoComplete="email"
                  className="h-10 px-3 rounded-xl bg-[#0d0f14] border border-[#2a2d35] text-sm text-gray-100 placeholder:text-gray-600 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 transition-colors"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 -mt-1">
              Add your email if you&apos;d like a reply.
            </p>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={messageId} className="text-xs font-medium text-gray-300">
                Message
              </label>
              <textarea
                ref={messageRef}
                id={messageId}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={MAX_MESSAGE}
                readOnly={submitting}
                rows={5}
                className="min-h-[120px] resize-none px-3 py-2 rounded-xl bg-[#0d0f14] border border-[#2a2d35] text-sm text-gray-100 placeholder:text-gray-600 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 transition-colors"
                aria-describedby={serverError ? errorId : undefined}
              />
              <div className="flex justify-end text-xs">
                <span
                  aria-live="polite"
                  className={nearLimit ? 'text-amber-400' : 'text-gray-500'}
                >
                  {message.length}/{MAX_MESSAGE}
                </span>
              </div>
            </div>

            {serverError && (
              <div
                id={errorId}
                role="alert"
                aria-live="polite"
                className="flex items-start gap-2 px-3 py-2 rounded-xl border border-red-500/40 bg-red-500/10 text-sm text-red-300"
              >
                <span>{serverError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="h-10 px-4 rounded-lg border border-[#2a2d35] hover:border-gray-500 disabled:opacity-60 text-sm text-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitDisabled}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
              >
                {submitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
                {submitting ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
