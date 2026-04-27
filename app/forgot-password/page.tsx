'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BrandLockup } from '@/components/ui/brand-lockup';
import { CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Something went wrong. Please try again.');
      return;
    }

    setSent(true);
  }

  return (
    <main className="min-h-screen bg-canvas-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-header-bg border border-panel-border rounded-xl p-8 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <BrandLockup showVersion={false} />
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-100">Forgot your password?</h1>
              <p className="text-sm text-gray-400 mt-1">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>
          </div>

          {sent ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <CheckCircle className="w-10 h-10 text-green-400" strokeWidth={1.5} />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-100">Check your inbox</p>
                <p className="text-xs text-gray-400 mt-1">
                  If an account exists for <span className="text-gray-300">{email}</span>, a reset
                  link has been sent. It expires in 1 hour.
                </p>
              </div>
              <Link
                href="/sign-in"
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-medium text-gray-400">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 rounded-lg bg-canvas-bg border border-panel-border
                    text-sm text-gray-100 placeholder-gray-600
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors"
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
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}

          {!sent && (
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
