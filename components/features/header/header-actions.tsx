'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { clearCurrentNamespace } from '@/lib/diagram-storage';
import { AccountModal } from './account-modal';

interface HeaderActionsProps {
  onUpgrade?: () => void;
  onBeforeSignOut: () => void;
}

export function HeaderActions({ onUpgrade, onBeforeSignOut }: HeaderActionsProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  if (status === 'loading') {
    return <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" aria-hidden="true" />;
  }

  if (status === 'unauthenticated') {
    return (
      <button
        type="button"
        onClick={() => router.push('/sign-in')}
        className="px-3 py-1.5 rounded text-xs font-medium text-gray-400
          hover:text-gray-200 border border-gray-700 hover:border-gray-500
          transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        Sign in
      </button>
    );
  }

  const user = session?.user;
  const isPro = user?.tier === 'pro';

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Avatar with tier badge overlay */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label="Account settings"
          className="relative flex-shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e1015] hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center overflow-hidden">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name ?? 'Avatar'} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-medium text-gray-300" aria-hidden="true">{initials}</span>
            )}
          </div>
          {/* Tier badge */}
          <span
            aria-label={isPro ? 'Pro plan' : 'Free plan'}
            className={`absolute -bottom-0.5 -right-0.5 text-[8px] font-bold px-1 leading-tight rounded-sm ${
              isPro ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}
          >
            {isPro ? 'PRO' : 'FREE'}
          </span>
        </button>

        {/* Sign out */}
        <button
          type="button"
          onClick={() => { onBeforeSignOut(); clearCurrentNamespace(); signOut({ callbackUrl: '/sign-in' }); }}
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          Sign out
        </button>
      </div>

      {modalOpen && (
        <AccountModal
          onClose={() => setModalOpen(false)}
          onUpgrade={() => { setModalOpen(false); onUpgrade?.(); }}
          onBeforeSignOut={onBeforeSignOut}
        />
      )}
    </>
  );
}
