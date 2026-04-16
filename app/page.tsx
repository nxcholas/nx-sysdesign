'use client';

import { useRef, useCallback } from 'react';
import { usePlacedComponents } from '@/hooks/use-placed-components';
import { useCanvas } from '@/hooks/use-canvas';
import { useDiagrams } from '@/hooks/use-diagrams';
import { Header } from '@/components/features/header/header';
import { SidePanel } from '@/components/features/side-panel/side-panel';
import { CanvasRoot } from '@/components/features/canvas/canvas-root';

export default function Page() {
  const canvasRef = useRef<HTMLDivElement>(null);

  const canvasHook = usePlacedComponents();
  const canvasTransformHook = useCanvas(canvasRef);

  // Stable getter refs — avoids stale closures in debounce callbacks
  const canvasStateRef = useRef(canvasHook.state);
  canvasStateRef.current = canvasHook.state;
  const getCanvasState = useCallback(() => canvasStateRef.current, []);

  const transformRef = useRef(canvasTransformHook.transform);
  transformRef.current = canvasTransformHook.transform;
  const getTransform = useCallback(() => transformRef.current, []);

  const diagrams = useDiagrams({
    getCanvasState,
    loadDiagram: canvasHook.loadDiagram,
    getTransform,
    setTransform: canvasTransformHook.setTransform,
  });

  const onStateChange = useCallback(() => {
    diagrams.notifyStateChanged();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagrams]);

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
          updateTableHeader={canvasHook.updateTableHeader}
          addTableRow={canvasHook.addTableRow}
          removeTableRow={canvasHook.removeTableRow}
          renameTableRow={canvasHook.renameTableRow}
          cycleTableKey={canvasHook.cycleTableKey}
          updateConnectionCardinality={canvasHook.updateConnectionCardinality}
          transform={canvasTransformHook.transform}
          canvasRef={canvasRef}
          didPanRef={canvasTransformHook.didPanRef}
          spaceHeldRef={canvasTransformHook.spaceHeldRef}
          ctrlHeldRef={canvasTransformHook.ctrlHeldRef}
          handlePointerDown={canvasTransformHook.handlePointerDown}
          handlePointerMove={canvasTransformHook.handlePointerMove}
          handlePointerUp={canvasTransformHook.handlePointerUp}
          resetTransform={canvasTransformHook.resetTransform}
          onStateChange={onStateChange}
        />
      </div>
    </div>
  );
}
