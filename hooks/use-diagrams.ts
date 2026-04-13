'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CanvasState, CanvasTransform, DiagramSchema, SaveMode } from '@/lib/types';
import {
  readAllDiagrams,
  readActiveDiagramId,
  readOpenTabIds,
  readSaveMode,
  writeAllDiagrams,
  writeActiveDiagramId,
  writeOpenTabIds,
  writeSaveMode,
  writeDiagram,
  deleteDiagram,
  createBlankDiagram,
  computeNextUntitledName,
} from '@/lib/diagram-storage';

interface UseDiagramsOptions {
  getCanvasState: () => CanvasState;
  loadDiagram: (schema: Pick<DiagramSchema, 'components' | 'connections' | 'frames'>) => void;
  getTransform: () => CanvasTransform;
  setTransform: (t: CanvasTransform) => void;
}

interface UseDiagramsReturn {
  diagrams: DiagramSchema[];
  activeDiagramId: string;
  openTabIds: string[];
  saveMode: SaveMode;
  isDirty: boolean;
  activeDiagram: DiagramSchema | null;
  switchToDiagram: (id: string) => void;
  openNewDiagram: () => void;
  closeTab: (id: string) => void;
  renameDiagram: (id: string, name: string) => void;
  reorderTabs: (newOrder: string[]) => void;
  setSaveMode: (mode: SaveMode) => void;
  manualSave: () => void;
  notifyStateChanged: () => void;
}

export function useDiagrams(options: UseDiagramsOptions): UseDiagramsReturn {
  // Stable ref to options to avoid stale closures in callbacks
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [diagrams, setDiagrams] = useState<DiagramSchema[]>([]);
  const [activeDiagramId, setActiveDiagramId] = useState<string>('');
  const [openTabIds, setOpenTabIds] = useState<string[]>([]);
  const [saveMode, setSaveModeState] = useState<SaveMode>('auto');
  const [isDirty, setIsDirty] = useState(false);

  // Mirror diagrams in a ref for use inside closures
  const diagramsRef = useRef<DiagramSchema[]>([]);
  diagramsRef.current = diagrams;

  const activeDiagramIdRef = useRef<string>('');
  activeDiagramIdRef.current = activeDiagramId;

  const openTabIdsRef = useRef<string[]>([]);
  openTabIdsRef.current = openTabIds;

  const saveModeRef = useRef<SaveMode>('auto');
  saveModeRef.current = saveMode;

  // Guard that prevents saving while a diagram is being loaded
  const isLoadingRef = useRef(false);

  // Debounce timer ref for auto-save
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Core save logic ---

  const performSave = useCallback(() => {
    const currentId = activeDiagramIdRef.current;
    if (!currentId) return;

    const canvasState = optionsRef.current.getCanvasState();
    const viewport = optionsRef.current.getTransform();

    const existing = diagramsRef.current.find((d) => d.id === currentId);
    if (!existing) return;

    const updated: DiagramSchema = {
      ...existing,
      components: canvasState.placedComponents,
      connections: canvasState.connections,
      frames: canvasState.frames,
      viewport,
      updatedAt: new Date().toISOString(),
    };

    writeDiagram(updated);

    setDiagrams((prev) =>
      prev.map((d) => (d.id === currentId ? updated : d))
    );
    setIsDirty(false);
  }, []);

  const scheduleAutoSave = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(performSave, 500);
  }, [performSave]);

  // --- notifyStateChanged — called by CanvasRoot on state changes ---

  const notifyStateChanged = useCallback(() => {
    if (isLoadingRef.current) return;

    if (saveModeRef.current === 'auto') {
      scheduleAutoSave();
    } else {
      setIsDirty(true);
    }
  }, [scheduleAutoSave]);

  // --- Initialization on mount ---

  useEffect(() => {
    let allDiagrams = readAllDiagrams();
    let activeDiagramIdVal = readActiveDiagramId();
    let openTabIdsVal = readOpenTabIds();
    const savedMode = readSaveMode();

    // Ensure at least one diagram exists
    if (allDiagrams.length === 0) {
      const blank = createBlankDiagram(computeNextUntitledName([]));
      writeDiagram(blank);
      allDiagrams = [blank];
      activeDiagramIdVal = blank.id;
      openTabIdsVal = [blank.id];
    }

    const diagramIds = new Set(allDiagrams.map((d) => d.id));

    // Repair openTabIds: filter to only IDs present in diagrams
    const repairedTabs = openTabIdsVal.filter((id) => diagramIds.has(id));
    // allDiagrams is guaranteed non-empty at this point (we created a blank above if empty)
    const firstDiagramId = allDiagrams[0]!.id;
    const finalTabs = repairedTabs.length > 0 ? repairedTabs : [firstDiagramId];

    // Validate activeDiagramId
    // finalTabs is guaranteed non-empty — the fallback above ensures at least one entry
    const finalActiveId: string =
      activeDiagramIdVal && diagramIds.has(activeDiagramIdVal)
        ? activeDiagramIdVal
        : (finalTabs[0] as string);

    // Persist repaired state
    writeActiveDiagramId(finalActiveId);
    writeOpenTabIds(finalTabs);

    // Set React state
    setDiagrams(allDiagrams);
    setActiveDiagramId(finalActiveId);
    setOpenTabIds(finalTabs);
    setSaveModeState(savedMode);

    // Load the active diagram into the canvas
    const activeDiagram = allDiagrams.find((d) => d.id === finalActiveId);
    if (activeDiagram) {
      isLoadingRef.current = true;
      optionsRef.current.loadDiagram({
        components: activeDiagram.components,
        connections: activeDiagram.connections,
        frames: activeDiagram.frames,
      });
      optionsRef.current.setTransform(activeDiagram.viewport);
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs only on mount

  // --- switchToDiagram ---

  const switchToDiagram = useCallback(
    (id: string) => {
      // Save current diagram first
      performSave();

      // Cancel pending debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Add to open tabs if not already there
      const currentTabs = openTabIdsRef.current;
      const newTabs = currentTabs.includes(id) ? currentTabs : [...currentTabs, id];

      setOpenTabIds(newTabs);
      setActiveDiagramId(id);

      // Load diagram content
      const target = diagramsRef.current.find((d) => d.id === id);
      if (target) {
        isLoadingRef.current = true;
        optionsRef.current.loadDiagram({
          components: target.components,
          connections: target.connections,
          frames: target.frames,
        });
        optionsRef.current.setTransform(target.viewport);
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 0);
      }

      // Persist
      writeActiveDiagramId(id);
      writeOpenTabIds(newTabs);

      setIsDirty(false);
    },
    [performSave]
  );

  // --- openNewDiagram ---

  const openNewDiagram = useCallback(() => {
    performSave();

    const name = computeNextUntitledName(diagramsRef.current);
    const newDiagram = createBlankDiagram(name);
    writeDiagram(newDiagram);

    setDiagrams((prev) => [...prev, newDiagram]);
    setOpenTabIds((prev) => {
      const updated = [...prev, newDiagram.id];
      writeOpenTabIds(updated);
      return updated;
    });

    // Switch to the new diagram (it will be loaded as blank)
    isLoadingRef.current = true;
    optionsRef.current.loadDiagram({
      components: [],
      connections: [],
      frames: [],
    });
    optionsRef.current.setTransform(newDiagram.viewport);
    setTimeout(() => {
      isLoadingRef.current = false;
    }, 0);

    setActiveDiagramId(newDiagram.id);
    writeActiveDiagramId(newDiagram.id);
    setIsDirty(false);
  }, [performSave]);

  // --- closeTab ---

  const closeTab = useCallback(
    (id: string) => {
      // Save current state before any tab manipulation (prevents silent data loss
      // when closing the active tab in manual save mode with unsaved changes).
      performSave();

      const currentDiagrams = diagramsRef.current;
      const currentTabs = openTabIdsRef.current;
      const currentActiveId = activeDiagramIdRef.current;

      // If this is the only diagram, confirm and replace with blank
      if (currentDiagrams.length === 1) {
        const diagramName = currentDiagrams.find((d) => d.id === id)?.name ?? 'this diagram';
        const confirmed = window.confirm(
          `Delete diagram "${diagramName}"? This cannot be undone.`
        );
        if (!confirmed) return;

        deleteDiagram(id);

        const name = computeNextUntitledName([]);
        const blank = createBlankDiagram(name);
        writeDiagram(blank);

        setDiagrams([blank]);
        setOpenTabIds([blank.id]);
        setActiveDiagramId(blank.id);
        writeActiveDiagramId(blank.id);
        writeOpenTabIds([blank.id]);

        isLoadingRef.current = true;
        optionsRef.current.loadDiagram({
          components: [],
          connections: [],
          frames: [],
        });
        optionsRef.current.setTransform(blank.viewport);
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 0);

        setIsDirty(false);
        return;
      }

      const isActiveTab = id === currentActiveId;
      const tabIndex = currentTabs.indexOf(id);
      const newTabs = currentTabs.filter((t) => t !== id);

      if (!isActiveTab) {
        // Simply remove from tabs and delete
        deleteDiagram(id);
        setDiagrams((prev) => prev.filter((d) => d.id !== id));
        setOpenTabIds(newTabs);
        writeOpenTabIds(newTabs);
        return;
      }

      // Active tab being closed — switch to neighbor first
      const neighborId =
        tabIndex > 0
          ? currentTabs[tabIndex - 1]   // prefer left neighbor
          : currentTabs[tabIndex + 1];   // fallback to right neighbor

      // Switch to neighbor, then delete
      if (neighborId) {
        const neighborDiagram = currentDiagrams.find((d) => d.id === neighborId);
        if (neighborDiagram) {
          isLoadingRef.current = true;
          optionsRef.current.loadDiagram({
            components: neighborDiagram.components,
            connections: neighborDiagram.connections,
            frames: neighborDiagram.frames,
          });
          optionsRef.current.setTransform(neighborDiagram.viewport);
          setTimeout(() => {
            isLoadingRef.current = false;
          }, 0);
        }
        setActiveDiagramId(neighborId);
        writeActiveDiagramId(neighborId);
      }

      deleteDiagram(id);
      setDiagrams((prev) => prev.filter((d) => d.id !== id));
      setOpenTabIds(newTabs);
      writeOpenTabIds(newTabs);
      setIsDirty(false);
    },
    [performSave]
  );

  // --- renameDiagram ---

  const renameDiagram = useCallback((id: string, name: string) => {
    const existing = diagramsRef.current.find((d) => d.id === id);
    if (!existing) return;

    const updated: DiagramSchema = {
      ...existing,
      name,
      updatedAt: new Date().toISOString(),
    };

    writeDiagram(updated);
    setDiagrams((prev) => prev.map((d) => (d.id === id ? updated : d)));
  }, []);

  // --- reorderTabs ---

  const reorderTabs = useCallback((newOrder: string[]) => {
    const current = openTabIdsRef.current;
    // Validate: same IDs, just reordered
    if (
      newOrder.length !== current.length ||
      !newOrder.every((id) => current.includes(id))
    ) {
      return;
    }
    setOpenTabIds(newOrder);
    writeOpenTabIds(newOrder);
  }, []);

  // --- setSaveMode ---

  const setSaveMode = useCallback((mode: SaveMode) => {
    if (mode === 'manual' && saveModeRef.current === 'auto') {
      // Switching auto → manual: clear pending debounce without firing
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    }
    setSaveModeState(mode);
    writeSaveMode(mode);
  }, []);

  // --- manualSave ---

  const manualSave = useCallback(() => {
    performSave();
  }, [performSave]);

  // --- Computed values ---

  const activeDiagram = diagrams.find((d) => d.id === activeDiagramId) ?? null;

  return {
    diagrams,
    activeDiagramId,
    openTabIds,
    saveMode,
    isDirty,
    activeDiagram,
    switchToDiagram,
    openNewDiagram,
    closeTab,
    renameDiagram,
    reorderTabs,
    setSaveMode,
    manualSave,
    notifyStateChanged,
  };
}
