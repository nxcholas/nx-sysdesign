'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Bug, CheckCircle2, Loader2, X } from 'lucide-react';

interface BugReportModalProps {
  onClose: () => void;
  activeDiagramId: string | null;
  activeDiagramName: string | null;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

const MAX_DESCRIPTION = 4000;
const MAX_STEPS = 4000;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function BugReportModal({
  onClose,
  activeDiagramId,
  activeDiagramName,
  returnFocusRef,
}: BugReportModalProps) {
  const { data: session } = useSession();
  const titleId = useId();
  const descId = useId();
  const descriptionFieldId = useId();
  const stepsId = useId();
  const errorId = useId();

  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    descRef.current?.focus();
  }, []);

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

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => onClose(), 2000);
    return () => clearTimeout(t);
  }, [success, onClose]);

  const trimmedDescription = description.trim();
  const submitDisabled = submitting || rateLimited || trimmedDescription.length === 0;
  const descNearLimit = description.length >= MAX_DESCRIPTION * 0.9;
  const stepsNearLimit = steps.length >= MAX_STEPS * 0.9;

  const userEmail = session?.user?.email ?? null;
  const userTier = session?.user?.tier ?? null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitDisabled) return;
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback/bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: trimmedDescription,
          stepsToReproduce: steps.trim() || undefined,
          diagramId: activeDiagramId ?? undefined,
          diagramName: activeDiagramName ?? undefined,
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
        className="relative w-full max-w-lg bg-[#111318] border border-[#2a2d35] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
              <Bug size={16} aria-hidden="true" />
            </div>
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-gray-100">
                Report a bug
              </h2>
              <p id={descId} className="text-sm text-gray-400 mt-0.5">
                We&apos;ll attach your session and current diagram automatically.
              </p>
            </div>
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
            <CheckCircle2
              size={40}
              className="text-emerald-400"
              aria-hidden="true"
            />
            <p className="text-sm text-gray-200">
              Thanks — your report is on its way.
            </p>
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
            {/* Read-only context strip */}
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#2a2d35] bg-[#0d0f14] text-xs text-gray-300">
                <span className="text-gray-500">Diagram:</span>{' '}
                <span className="font-medium text-gray-200 truncate max-w-[200px]">
                  {activeDiagramName ?? 'Untitled'}
                </span>
              </span>
              {userEmail && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-[#2a2d35] bg-[#0d0f14] text-xs text-gray-300">
                  {userEmail}
                </span>
              )}
              {userTier && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-medium text-blue-300 uppercase tracking-wide">
                  {userTier}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={descriptionFieldId} className="text-xs font-medium text-gray-300">
                Description
              </label>
              <textarea
                ref={descRef}
                id={descriptionFieldId}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={MAX_DESCRIPTION}
                readOnly={submitting}
                required
                rows={5}
                placeholder=""
                className="min-h-[120px] resize-none px-3 py-2 rounded-xl bg-[#0d0f14] border border-[#2a2d35] text-sm text-gray-100 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 transition-colors"
                aria-describedby={serverError ? errorId : undefined}
              />
              <div className="flex justify-end text-xs">
                <span
                  aria-live="polite"
                  className={descNearLimit ? 'text-amber-400' : 'text-gray-500'}
                >
                  {description.length}/{MAX_DESCRIPTION}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={stepsId} className="text-xs font-medium text-gray-300">
                Steps to reproduce <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <textarea
                id={stepsId}
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                maxLength={MAX_STEPS}
                readOnly={submitting}
                rows={4}
                className="min-h-[100px] resize-none px-3 py-2 rounded-xl bg-[#0d0f14] border border-[#2a2d35] text-sm text-gray-100 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 transition-colors"
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Optional — what did you do right before this?</span>
                <span
                  aria-live="polite"
                  className={stepsNearLimit ? 'text-amber-400' : 'text-gray-500'}
                >
                  {steps.length}/{MAX_STEPS}
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
                {submitting ? 'Sending…' : 'Send report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
