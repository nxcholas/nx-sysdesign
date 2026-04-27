'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BrandLockup } from '@/components/ui/brand-lockup';
import { PasswordInput } from '@/components/ui/password-input';
import { CheckCircle, AlertCircle } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('This reset link is invalid. Please request a new one.');
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Something went wrong. Please try again.');
      return;
    }

    setSuccess(true);
    setTimeout(() => { window.location.href = '/sign-in'; }, 3000);
  }

  return (
    <main className="min-h-screen bg-canvas-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-header-bg border border-panel-border rounded-xl p-8 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <BrandLockup showVersion={false} />
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-100">Choose a new password</h1>
              <p className="text-sm text-gray-400 mt-1">
                Must be at least 8 characters with a number and a special character.
              </p>
            </div>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <CheckCircle className="w-10 h-10 text-green-400" strokeWidth={1.5} />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-100">Password updated</p>
                <p className="text-xs text-gray-400 mt-1">
                  Redirecting you to sign in…
                </p>
              </div>
            </div>
          ) : !token ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <AlertCircle className="w-10 h-10 text-red-400" strokeWidth={1.5} />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-100">Invalid reset link</p>
                <p className="text-xs text-gray-400 mt-1">
                  This link is missing or malformed.
                </p>
              </div>
              <Link
                href="/forgot-password"
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
              >
                Request a new reset link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-xs font-medium text-gray-400">
                  New password
                </label>
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm" className="text-xs font-medium text-gray-400">
                  Confirm password
                </label>
                <PasswordInput
                  id="confirm"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              {error && (
                <p role="alert" className="text-xs text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center h-10 rounded-lg
                  bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed
                  text-sm font-medium text-white transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          )}

          {!success && token && (
            <Link
              href="/sign-in"
              className="text-center text-xs text-gray-600 hover:text-gray-400 transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              ← Back to sign in
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
