'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BrandLockup } from '@/components/ui/brand-lockup';

// These errors mean the user cancelled or denied access — redirect silently back to sign-in
const REDIRECT_ERRORS = new Set(['AccessDenied', 'OAuthCallbackError', 'OAuthSignin', 'Callback']);

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    'This email is already associated with a different sign-in method. Please use the original method you signed up with.',
  SessionRequired: 'You need to be signed in to access that page.',
  Default: 'Something went wrong during sign-in. Please try again.',
};

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error') ?? 'Default';

  useEffect(() => {
    if (REDIRECT_ERRORS.has(error)) {
      router.replace('/sign-in');
    }
  }, [error, router]);

  if (REDIRECT_ERRORS.has(error)) {
    return null;
  }

  const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;

  return (
    <main className="min-h-screen bg-canvas-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-header-bg border border-panel-border rounded-xl p-8 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <BrandLockup showVersion={false} />
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-100">Sign-in error</h1>
              <p className="text-sm text-gray-400 mt-1">{message}</p>
            </div>
          </div>

          <Link
            href="/sign-in"
            className="w-full flex items-center justify-center h-10 rounded-lg
              bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Back to sign in
          </Link>

          <Link
            href="/"
            className="text-center text-xs text-gray-600 hover:text-gray-400 transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
