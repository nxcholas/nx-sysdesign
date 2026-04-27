'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { BrandLockup } from '@/components/ui/brand-lockup';
import { OtpInput } from '@/components/ui/otp-input';
import { CheckCircle } from 'lucide-react';

const RESEND_COOLDOWN = 60;

export default function VerifyEmailRequiredPage() {
  const { data: session, update: updateSession } = useSession();

  const [code, setCode] = useState('');
  const [inputState, setInputState] = useState<'idle' | 'error' | 'success'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);

  const [resending, setResending] = useState(false);
  const [resendState, setResendState] = useState<'idle' | 'sent' | 'error'>('idle');
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const email = session?.user?.email ?? 'your email address';

  // Start cooldown countdown
  function startCooldown() {
    setCooldown(RESEND_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const submitCode = useCallback(async (value: string) => {
    if (value.length !== 6 || loading || locked) return;

    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: value }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      setInputState('success');
      await updateSession();
      window.location.href = '/canvas';
      return;
    }

    setLoading(false);
    setError(data.error ?? 'Something went wrong. Please try again.');

    if (data.locked) {
      setLocked(true);
      setInputState('error');
      return;
    }

    setInputState('error');
    // Clear boxes and refocus after shake animation
    setTimeout(() => {
      setCode('');
      setInputState('idle');
    }, 600);
  }, [loading, locked, updateSession]);

  function handleCodeChange(value: string) {
    if (locked) return;
    setCode(value);
    setError('');
    if (value.length === 6) {
      submitCode(value);
    }
  }

  async function handleResend() {
    if (resending || cooldown > 0) return;
    setResending(true);
    setResendState('idle');
    setLocked(false);
    setError('');

    const res = await fetch('/api/auth/resend-verification', { method: 'POST' });

    setResending(false);

    if (res.ok) {
      setResendState('sent');
      setCode('');
      setInputState('idle');
      startCooldown();
    } else {
      setResendState('error');
    }
  }

  return (
    <main className="min-h-screen bg-canvas-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-header-bg border border-panel-border rounded-xl p-8 flex flex-col gap-6">

          <div className="flex flex-col items-center gap-4">
            <BrandLockup showVersion={false} />
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-100">Check your inbox</h1>
              <p className="text-sm text-gray-400 mt-1">
                We sent a 6-digit code to{' '}
                <span className="text-gray-200 font-medium">{email}</span>.
                Enter it below to verify your account.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <OtpInput
              value={code}
              onChange={handleCodeChange}
              disabled={loading || inputState === 'success'}
              state={inputState}
              autoFocus
            />

            {error && (
              <p role="alert" className="text-xs text-red-400 text-center">
                {error}
              </p>
            )}

            {inputState === 'success' && (
              <div className="flex items-center gap-2 text-xs text-green-400">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                <span>Verified! Taking you to the app…</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => submitCode(code)}
            disabled={code.length < 6 || loading || locked || inputState === 'success'}
            className="w-full flex items-center justify-center h-10 rounded-lg
              bg-blue-600 hover:bg-blue-500
              disabled:opacity-40 disabled:cursor-not-allowed
              text-sm font-medium text-white transition-colors cursor-pointer
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {loading ? 'Verifying…' : 'Verify email'}
          </button>

          <div className="flex flex-col gap-2 items-center">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Didn&apos;t receive a code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="text-blue-400 hover:text-blue-300 transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
                  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded"
              >
                {resending
                  ? 'Sending…'
                  : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : 'Resend code'}
              </button>
            </div>

            {resendState === 'sent' && (
              <p className="text-xs text-green-400 flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 shrink-0" strokeWidth={2} />
                New code sent — check your inbox.
              </p>
            )}

            {resendState === 'error' && (
              <p role="alert" className="text-xs text-red-400">
                Failed to resend. Please try again.
              </p>
            )}
          </div>

          <div className="border-t border-panel-border pt-2">
            <p className="text-xs text-gray-500 text-center">
              Wrong email?{' '}
              <button
                type="button"
                onClick={() => void signOut({ callbackUrl: `${window.location.origin}/sign-in` })}
                className="text-blue-400 hover:text-blue-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded"
              >
                Sign out
              </button>{' '}
              and create a new account.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
