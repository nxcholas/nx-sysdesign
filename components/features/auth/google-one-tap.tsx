'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select: boolean;
            cancel_on_tap_outside: boolean;
            itp_support: boolean;
          }) => void;
          prompt: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

export function GoogleOneTap() {
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    function initOneTap() {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: clientId!,
        callback: handleCredential,
        auto_select: true,
        cancel_on_tap_outside: false,
        itp_support: true,
      });

      window.google.accounts.id.prompt();
    }

    async function handleCredential(response: { credential: string }) {
      try {
        const res = await fetch('/api/auth/one-tap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        });

        if (!res.ok) return;

        const { oneTapToken } = await res.json() as { oneTapToken: string };

        await signIn('credentials', {
          onetapToken: oneTapToken,
          redirect: true,
          redirectTo: '/canvas',
        });
      } catch {
        // One Tap is a progressive enhancement — silent failure is acceptable since
        // the user can still sign in via the Google OAuth button or credentials form.
      }
    }

    if (window.google?.accounts?.id) {
      initOneTap();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initOneTap;
    document.head.appendChild(script);

    return () => {
      window.google?.accounts?.id?.cancel();
    };
  }, []);

  return null;
}
