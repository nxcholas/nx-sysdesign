'use client';

// Placeholder for future authentication and header actions.
// Replace this component with real auth UI (sign in, user avatar, etc.)

export function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      {/* Future: Share button */}
      <button
        type="button"
        disabled
        className="px-3 py-1.5 rounded text-xs font-medium text-gray-500
          border border-gray-700 cursor-not-allowed opacity-50"
        aria-label="Share diagram (coming soon)"
        title="Coming soon"
      >
        Share
      </button>

      {/* Future: Auth / user avatar */}
      <div
        className="w-7 h-7 rounded-full bg-gray-700 border border-gray-600
          flex items-center justify-center text-gray-400"
        aria-label="Sign in (coming soon)"
        title="Authentication coming soon"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}
