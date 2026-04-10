import { Separator } from '@/components/ui/separator';
import { HeaderActions } from './header-actions';

export function Header() {
  return (
    <header className="h-12 flex-shrink-0 bg-header-bg border-b border-header-border flex items-center px-4 gap-3">
      {/* Logo / brand */}
      <div className="flex items-center gap-2">
        <div
          aria-hidden="true"
          className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-3.5 h-3.5"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-100 tracking-tight">
          SysDesign
        </span>
      </div>

      <Separator orientation="vertical" className="h-5" />

      {/* Diagram title placeholder */}
      <span className="text-sm text-gray-500 font-mono">
        Untitled diagram
      </span>

      {/* Push auth actions to the right */}
      <div className="ml-auto">
        <HeaderActions />
      </div>
    </header>
  );
}
