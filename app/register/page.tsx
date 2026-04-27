'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BrandLockup } from '@/components/ui/brand-lockup';
import { PasswordInput } from '@/components/ui/password-input';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() || undefined, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string };
      setError(data.error ?? 'Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    // Auto sign-in after successful registration — normalize email to match stored value
    const result = await signIn('credentials', {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      // Account created but sign-in failed — send them to sign-in page
      router.push('/sign-in');
      return;
    }

    router.push('/canvas');
  }

  async function handleGitHub() {
    setGithubLoading(true);
    await signIn('github', { redirectTo: '/canvas' });
  }

  return (
    <main className="min-h-screen bg-canvas-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-header-bg border border-panel-border rounded-xl p-8 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <BrandLockup showVersion={false} />
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-100">Create an account</h1>
              <p className="text-sm text-gray-400 mt-1">
                Start diagramming and save your work to the cloud.
              </p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-medium text-gray-400">
                Name <span className="text-gray-600">(optional)</span>
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 rounded-lg bg-canvas-bg border border-panel-border
                  text-sm text-gray-100 placeholder-gray-600
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors"
              />
            </div>

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

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium text-gray-400">
                Password
              </label>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-gray-600">
                8+ characters, at least one number and one special character.
              </p>
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
              disabled={loading || githubLoading}
              className="w-full flex items-center justify-center h-10 rounded-lg
                bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed
                text-sm font-medium text-white transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-panel-border" />
            <span className="text-xs text-gray-600">or</span>
            <div className="flex-1 h-px bg-panel-border" />
          </div>

          <button
            type="button"
            onClick={handleGitHub}
            disabled={loading || githubLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
              bg-gray-800 hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed
              border border-gray-600 text-sm font-medium text-gray-100 transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            {githubLoading ? 'Redirecting to GitHub…' : 'Continue with GitHub'}
          </button>

          <p className="text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link
              href="/sign-in"
              className="text-blue-400 hover:text-blue-300 transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              Sign in
            </Link>
          </p>

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
