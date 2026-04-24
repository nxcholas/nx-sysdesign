'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { clearCurrentNamespace } from '@/lib/diagram-storage';

interface HeaderActionsProps {
  onUpgrade?: () => void;
}

export function HeaderActions({ onUpgrade }: HeaderActionsProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-700 animate-pulse" aria-hidden="true" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.push('/sign-in')}
          className="px-3 py-1.5 rounded text-xs font-medium text-gray-400
            hover:text-gray-200 border border-gray-700 hover:border-gray-500
            transition-colors focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-blue-500"
        >
          Sign in
        </button>
      </div>
    );
  }

  const user = session?.user;
  const isPro = user?.tier === 'pro';

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  async function handleManageBilling() {
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const data = await res.json() as { url?: string };
    if (data.url) window.location.href = data.url;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Tier badge */}
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            isPro
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'bg-gray-700/60 text-gray-400 border border-gray-600/40'
          }`}
        >
          {isPro ? 'Pro' : 'Free'}
        </span>

        {/* Upgrade CTA (free only) */}
        {!isPro && (
          <button
            type="button"
            onClick={() => onUpgrade?.()}
            className="px-3 py-1.5 rounded text-xs font-semibold text-white
              bg-blue-600 hover:bg-blue-500 transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Upgrade
          </button>
        )}

        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full bg-gray-700 border border-gray-600
            flex items-center justify-center overflow-hidden flex-shrink-0"
          title={user?.name ?? user?.email ?? 'User'}
          aria-label={`Signed in as ${user?.name ?? user?.email ?? 'user'}`}
        >
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name ?? 'User avatar'} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-medium text-gray-300" aria-hidden="true">{initials}</span>
          )}
        </div>

        {/* Manage billing (pro only) */}
        {isPro && (
          <button
            type="button"
            onClick={handleManageBilling}
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            Billing
          </button>
        )}

        {/* Sign out */}
        <button
          type="button"
          onClick={() => { clearCurrentNamespace(); signOut({ callbackUrl: '/sign-in' }); }}
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          Sign out
        </button>
      </div>

    </>
  );
}
