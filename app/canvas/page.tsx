'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { track } from '@vercel/analytics';
import { usePlacedComponents } from '@/hooks/use-placed-components';
import { useCanvas } from '@/hooks/use-canvas';
import { useDiagrams } from '@/hooks/use-diagrams';
import { Header } from '@/components/features/header/header';
import { SidePanel } from '@/components/features/side-panel/side-panel';
import { CanvasRoot } from '@/components/features/canvas/canvas-root';
import { UpgradeModal } from '@/components/features/billing/upgrade-modal';
import { ZeroStateTemplates } from '@/components/features/canvas/zero-state-templates';
import { NewDiagramModal } from '@/components/features/canvas/new-diagram-modal';
import { DeleteDiagramModal } from '@/components/features/canvas/delete-diagram-modal';
import { BugReportFab } from '@/components/features/feedback/bug-report-fab';
import type { DiagramTemplate } from '@/lib/templates/index';

export default function Page() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const exportLayerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const { data: session, update: updateSession } = useSession();

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const sessionTierRef = useRef(session?.user?.tier);
  sessionTierRef.current = session?.user?.tier;

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Detect return from Stripe hosted checkout and start polling
  useEffect(() => {
    if (searchParams.get('checkout') !== 'success') return;
    const billingInterval = searchParams.get('interval');
    const url = new URL(window.location.href);
    url.searchParams.delete('checkout');
    url.searchParams.delete('interval');
    window.history.replaceState({}, '', url.toString());

    if (billingInterval === 'monthly') track('subscription_purchased_monthly');
    else if (billingInterval === 'yearly') track('subscription_purchased_yearly');

    let attempts = 0;
    const interval = setInterval(async () => {
      if (sessionTierRef.current === 'pro') { clearInterval(interval); return; }
      attempts++;
      await updateSession();
      if (attempts >= 15) clearInterval(interval);
    }, 1500);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once on mount

  const handleUpgradeSuccess = useCallback(() => {}, []);

  const canvasHook = usePlacedComponents();
  const canvasTransformHook = useCanvas(canvasRef);

  const canvasStateRef = useRef(canvasHook.state);
  canvasStateRef.current = canvasHook.state;
  const getCanvasState = useCallback(() => canvasStateRef.current, []);

  const transformRef = useRef(canvasTransformHook.transform);
  transformRef.current = canvasTransformHook.transform;
  const getTransform = useCallback(() => transformRef.current, []);

  const onUpgradeRequired = useCallback(() => setUpgradeOpen(true), []);

  const diagrams = useDiagrams({
    getCanvasState,
    loadDiagram: canvasHook.loadDiagram,
    getTransform,
    setTransform: canvasTransformHook.setTransform,
    onUpgradeRequired,
  });

  const { openNewDiagram, openFromTemplate } = diagrams;
  const handleSelectTemplate = useCallback((template: DiagramTemplate) => {
    setShowTemplateModal(false);
    if (template.id === 'blank') {
      openNewDiagram();
    } else {
      openFromTemplate(template.components, template.connections, template.frames);
    }
  }, [openNewDiagram, openFromTemplate]);

  const { closeTab } = diagrams;
  const handleCloseTab = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const { notifyStateChanged } = diagrams;
  const onStateChange = useCallback(() => {
    notifyStateChanged();
  }, [notifyStateChanged]);

  if (isMobile === null) {
    return <div className="h-screen w-screen bg-canvas-bg" />;
  }

  if (isMobile) {
    return (
      <main
        role="alert"
        className="h-screen w-screen flex flex-col items-center justify-center bg-canvas-bg text-gray-100 gap-6 px-6 text-center"
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-500"
        >
          <path d="M17 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v5" />
          <path d="m16 22 5-5" />
          <path d="m21 22-5-5" />
          <path d="M8 21h4" />
          <path d="M10 17v4" />
        </svg>
        <div>
          <h1 className="text-2xl font-semibold mb-2">Desktop Only</h1>
          <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
            NX-Design requires a desktop browser. The canvas editor uses drag,
            zoom, and keyboard shortcuts that aren&apos;t supported on mobile.
          </p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 text-sm rounded border border-gray-600 hover:border-gray-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
        >
          ← Back to home
        </Link>
      </main>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Header
        tabs={diagrams.openTabIds
          .map(id => diagrams.diagrams.find(x => x.id === id))
          .filter((d): d is NonNullable<typeof d> => d !== undefined)
          .map(d => ({ id: d.id, name: d.name }))}
        activeTabId={diagrams.activeDiagramId}
        saveMode={diagrams.saveMode}
        isDirty={diagrams.isDirty}
        onSelectTab={diagrams.switchToDiagram}
        onCloseTab={handleCloseTab}
        onRenameTab={diagrams.renameDiagram}
        onReorderTabs={diagrams.reorderTabs}
        onNewTab={() => setShowTemplateModal(true)}
        showNewTab={diagrams.diagrams.length > 0}
        onToggleSaveMode={diagrams.setSaveMode}
        isSaving={diagrams.isSaving}
        lastSavedAt={diagrams.lastSavedAt}
        onManualSave={diagrams.manualSave}
        onBeforeSignOut={diagrams.manualSave}
        onUpgrade={() => setUpgradeOpen(true)}
        exportLayerRef={exportLayerRef}
        placedComponents={canvasHook.placedComponents}
        frames={canvasHook.frames}
        activeDiagramName={diagrams.diagrams.find(d => d.id === diagrams.activeDiagramId)?.name ?? 'diagram'}
        transform={canvasTransformHook.transform}
      />
      <div className="flex flex-1 overflow-hidden">
        {diagrams.diagrams.length > 0 && <SidePanel />}
        {diagrams.isLoading ? (
          <div className="flex-1 bg-[#0d0f14] flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-gray-700 border-t-blue-500 animate-spin" aria-label="Loading diagrams" role="status" />
          </div>
        ) : diagrams.diagrams.length === 0 ? (
          <ZeroStateTemplates onSelect={handleSelectTemplate} />
        ) : (
        <CanvasRoot
          placedComponents={canvasHook.placedComponents}
          connections={canvasHook.connections}
          selectedIds={canvasHook.selectedIds}
          selectedConnectionId={canvasHook.selectedConnectionId}
          frames={canvasHook.frames}
          selectedFrameId={canvasHook.selectedFrameId}
          addComponent={canvasHook.addComponent}
          moveComponent={canvasHook.moveComponent}
          removeComponent={canvasHook.removeComponent}
          selectComponent={canvasHook.selectComponent}
          resizeComponent={canvasHook.resizeComponent}
          addConnection={canvasHook.addConnection}
          removeConnection={canvasHook.removeConnection}
          selectConnection={canvasHook.selectConnection}
          selectMany={canvasHook.selectMany}
          removeMany={canvasHook.removeMany}
          addFrame={canvasHook.addFrame}
          moveFrame={canvasHook.moveFrame}
          removeFrame={canvasHook.removeFrame}
          selectFrame={canvasHook.selectFrame}
          renameFrame={canvasHook.renameFrame}
          renameComponent={canvasHook.renameComponent}
          resizeFrame={canvasHook.resizeFrame}
          setComponentFrame={canvasHook.setComponentFrame}
          setFrameParent={canvasHook.setFrameParent}
          updateTableHeader={canvasHook.updateTableHeader}
          addTableRow={canvasHook.addTableRow}
          removeTableRow={canvasHook.removeTableRow}
          renameTableRow={canvasHook.renameTableRow}
          cycleTableKey={canvasHook.cycleTableKey}
          updateConnectionCardinality={canvasHook.updateConnectionCardinality}
          updateConnectionLabel={canvasHook.updateConnectionLabel}
          updateConnectionLabelT={canvasHook.updateConnectionLabelT}
          updateText={canvasHook.updateText}
          updateTextStyle={canvasHook.updateTextStyle}
          updateShapeStyle={canvasHook.updateShapeStyle}
          updateShapeKind={canvasHook.updateShapeKind}
          transform={canvasTransformHook.transform}
          canvasRef={canvasRef}
          exportLayerRef={exportLayerRef}
          didPanRef={canvasTransformHook.didPanRef}
          spaceHeldRef={canvasTransformHook.spaceHeldRef}
          ctrlHeldRef={canvasTransformHook.ctrlHeldRef}
          handlePointerDown={canvasTransformHook.handlePointerDown}
          handlePointerMove={canvasTransformHook.handlePointerMove}
          handlePointerUp={canvasTransformHook.handlePointerUp}
          resetTransform={canvasTransformHook.resetTransform}
          undo={canvasHook.undo}
          pasteComponents={canvasHook.pasteComponents}
          beginDragHistory={canvasHook.beginDragHistory}
          endDragHistory={canvasHook.endDragHistory}
          onStateChange={onStateChange}
          snapEnabled={snapEnabled}
          onSnapToggle={() => setSnapEnabled(v => !v)}
          onAlign={(dir) => canvasHook.alignComponents(canvasHook.selectedIds, dir)}
        />
        )}
      </div>

      {showTemplateModal && (
        <NewDiagramModal
          onClose={() => setShowTemplateModal(false)}
          onSelect={handleSelectTemplate}
        />
      )}
      {deleteConfirmId && (
        <DeleteDiagramModal
          diagramName={diagrams.diagrams.find(d => d.id === deleteConfirmId)?.name ?? 'this diagram'}
          onConfirm={() => {
            const id = deleteConfirmId;
            setDeleteConfirmId(null);
            closeTab(id);
          }}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} onSuccess={handleUpgradeSuccess} />}
      <BugReportFab
        activeDiagramId={diagrams.activeDiagramId ?? null}
        activeDiagramName={
          diagrams.diagrams.find((d) => d.id === diagrams.activeDiagramId)?.name ?? null
        }
        hasSidePanel={diagrams.diagrams.length > 0}
      />
    </div>
  );
}
