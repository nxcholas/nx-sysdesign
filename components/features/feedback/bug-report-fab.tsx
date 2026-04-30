'use client';

import { useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Bug } from 'lucide-react';
import { BugReportModal } from './bug-report-modal';

// SidePanel is w-64 (256px) and only renders when there are diagrams.
// When visible we offset the FAB past it so it floats over the canvas, not the sidebar.
const LEFT_WITH_PANEL = 'left-[calc(256px+1.5rem)]';
const LEFT_NO_PANEL   = 'left-6';

interface BugReportFabProps {
  activeDiagramId: string | null;
  activeDiagramName: string | null;
  hasSidePanel: boolean;
}

export function BugReportFab({ activeDiagramId, activeDiagramName, hasSidePanel }: BugReportFabProps) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Canvas requires auth, but defensively bail if unauthenticated.
  if (status === 'unauthenticated') return null;

  const leftClass = hasSidePanel ? LEFT_WITH_PANEL : LEFT_NO_PANEL;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Report a bug"
        className={`fixed bottom-6 ${leftClass} z-40 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-full bg-[#111318] border border-[#2a2d35] hover:border-gray-500 text-gray-100 shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0f14] motion-safe:active:scale-[0.98] cursor-pointer`}
      >
        <Bug size={18} aria-hidden="true" />
        <span className="text-sm font-medium">Report a bug</span>
      </button>
      {open && (
        <BugReportModal
          onClose={() => setOpen(false)}
          activeDiagramId={activeDiagramId}
          activeDiagramName={activeDiagramName}
          returnFocusRef={triggerRef}
        />
      )}
    </>
  );
}
