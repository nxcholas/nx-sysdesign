'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-canvas-bg text-gray-100 gap-4">
      <p className="text-sm text-gray-400">
        Something went wrong. Your diagram data is safe in local storage.
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 text-sm rounded border border-gray-600 hover:border-gray-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        Try again
      </button>
    </div>
  );
}
