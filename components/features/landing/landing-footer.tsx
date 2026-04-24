import React from 'react';

export function LandingFooter(): React.ReactElement {
  return (
    <footer className="border-t border-panel-border py-8 text-xs text-gray-500">
      <div className="mx-auto max-w-6xl px-6 md:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <span>© 2026 SysDesign</span>
        <div className="flex items-center gap-4">
          <span className="font-mono">v{process.env.NEXT_PUBLIC_APP_VERSION}-beta</span>
          <a
            href="#top"
            className="hover:text-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
