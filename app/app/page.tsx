'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { usePlacedComponents } from '@/hooks/use-placed-components';
import { useCanvas } from '@/hooks/use-canvas';
import { useDiagrams } from '@/hooks/use-diagrams';
import { Header } from '@/components/features/header/header';
import { SidePanel } from '@/components/features/side-panel/side-panel';
import { CanvasRoot } from '@/components/features/canvas/canvas-root';
import { UpgradeModal } from '@/components/features/billing/upgrade-modal';

export default function Page() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const { update: updateSession } = useSession();

  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      const url = new URL(window.location.href);
      url.searchParams.delete('checkout');
      window.history.replaceState({}, '', url.toString());
      void updateSession();
    }
  }, [searchParams, updateSession]);

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

  const { notifyStateChanged } = diagrams;
  const onStateChange = useCallback(() => {
    notifyStateChanged();
  }, [notifyStateChanged]);

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
        onCloseTab={diagrams.closeTab}
        onRenameTab={diagrams.renameDiagram}
        onReorderTabs={diagrams.reorderTabs}
        onNewTab={diagrams.openNewDiagram}
        onToggleSaveMode={diagrams.setSaveMode}
        onManualSave={diagrams.manualSave}
      />
      <div className="flex flex-1 overflow-hidden">
        <SidePanel />
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
          updateText={canvasHook.updateText}
          updateTextStyle={canvasHook.updateTextStyle}
          updateShapeStyle={canvasHook.updateShapeStyle}
          updateShapeKind={canvasHook.updateShapeKind}
          transform={canvasTransformHook.transform}
          canvasRef={canvasRef}
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
        />
      </div>

      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </div>
  );
}
