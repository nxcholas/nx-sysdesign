'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import type { CanvasState, CanvasTransform, DiagramSchema, Frame, PlacedComponent, Connection, SaveMode } from '@/lib/types';
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
  setStorageNamespace,
  migrateLegacyNamespace,
} from '@/lib/diagram-storage';

interface UseDiagramsOptions {
  getCanvasState: () => CanvasState;
  loadDiagram: (schema: Pick<DiagramSchema, 'components' | 'connections' | 'frames'>) => void;
  getTransform: () => CanvasTransform;
  setTransform: (t: CanvasTransform) => void;
  onUpgradeRequired?: () => void;
}

interface UseDiagramsReturn {
  diagrams: DiagramSchema[];
  activeDiagramId: string;
  openTabIds: string[];
  saveMode: SaveMode;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  activeDiagram: DiagramSchema | null;
  switchToDiagram: (id: string) => void;
  openNewDiagram: () => void;
  openFromTemplate: (components: PlacedComponent[], connections: Connection[], frames: Frame[]) => void;
  closeTab: (id: string) => void;
  renameDiagram: (id: string, name: string) => void;
  reorderTabs: (newOrder: string[]) => void;
  setSaveMode: (mode: SaveMode) => void;
  manualSave: () => Promise<void>;
  notifyStateChanged: () => void;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export function useDiagrams(options: UseDiagramsOptions): UseDiagramsReturn {
  // Stable ref to options to avoid stale closures in callbacks
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const { data: session, status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === 'authenticated';

  const [namespaceReady, setNamespaceReady] = useState(false);
  const [isLoading, setIsLoadingState] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

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

  const isAuthenticatedRef = useRef(isAuthenticated);
  isAuthenticatedRef.current = isAuthenticated;

  // Guard that prevents saving while a diagram is being loaded
  const isLoadingRef = useRef(false);

  // Debounce timer ref for auto-save
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Core save logic ---

  const performSave = useCallback((): Promise<void> => {
    const currentId = activeDiagramIdRef.current;
    if (!currentId) return Promise.resolve();

    const canvasState = optionsRef.current.getCanvasState();
    const viewport = optionsRef.current.getTransform();

    const existing = diagramsRef.current.find((d) => d.id === currentId);
    if (!existing) return Promise.resolve();

    const updated: DiagramSchema = {
      ...existing,
      components: canvasState.placedComponents,
      connections: canvasState.connections,
      frames: canvasState.frames,
      viewport,
      updatedAt: new Date().toISOString(),
    };

    // Always write to localStorage as crash-recovery cache
    writeDiagram(updated);

    setIsSaving(true);

    const finishSave = () => {
      setIsSaving(false);
      setLastSavedAt(new Date());
    };

    setDiagrams((prev) =>
      prev.map((d) => (d.id === currentId ? updated : d))
    );
    setIsDirty(false);

    // Return the API promise so callers (e.g. sign-out) can await completion
    if (isAuthenticatedRef.current) {
      return fetch(`/api/diagrams/${currentId}`, {
        method: 'PUT',
        headers: JSON_HEADERS,
        body: JSON.stringify(updated),
      })
        .then(finishSave)
        .catch((err) => {
          console.error('[useDiagrams] performSave API error:', err);
          finishSave();
        });
    }

    finishSave();
    return Promise.resolve();
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

  // --- Namespace effect: must resolve before init reads localStorage ---

  useEffect(() => {
    if (sessionStatus === 'loading') return;

    // One-time migration: copy diagrams stored under old sysdesign: prefix to nx-design: prefix.
    migrateLegacyNamespace();

    if (sessionStatus === 'authenticated' && session?.user?.id) {
      setStorageNamespace(`nx-design:user_${session.user.id}`);
    } else {
      setStorageNamespace('nx-design:anon');
    }
    setNamespaceReady(true);
  }, [sessionStatus, session?.user?.id]);

  // --- Initialization: runs once namespace is confirmed ---

  useEffect(() => {
    if (!namespaceReady) return;

    const allDiagrams = readAllDiagrams();
    const activeDiagramIdVal = readActiveDiagramId();
    const openTabIdsVal = readOpenTabIds();
    const savedMode = readSaveMode();

    setSaveModeState(savedMode);

    let finalTabs: string[] = [];
    let finalActiveId = '';

    if (allDiagrams.length === 0) {
      setDiagrams([]);
      setActiveDiagramId('');
      setOpenTabIds([]);
      // If authenticated, keep isLoading=true — the API fetch below will
      // resolve whether the user truly has no diagrams or just signed out
      // (which clears localStorage). Only resolve immediately for anonymous users.
      if (!isAuthenticatedRef.current) {
        setIsLoadingState(false);
      }
    } else {
      const diagramIds = new Set(allDiagrams.map((d) => d.id));

      // Repair openTabIds: filter to only IDs present in diagrams
      const repairedTabs = openTabIdsVal.filter((id) => diagramIds.has(id));
      const firstDiagramId = allDiagrams[0]!.id;
      finalTabs = repairedTabs.length > 0 ? repairedTabs : [firstDiagramId];

      // Validate activeDiagramId
      finalActiveId =
        activeDiagramIdVal && diagramIds.has(activeDiagramIdVal)
          ? activeDiagramIdVal
          : (finalTabs[0] as string);

      // Persist repaired state
      writeActiveDiagramId(finalActiveId);
      writeOpenTabIds(finalTabs);

      // Set React state immediately from localStorage (fast path)
      setDiagrams(allDiagrams);
      setActiveDiagramId(finalActiveId);
      setOpenTabIds(finalTabs);

      // Load the active diagram into the canvas
      const activeDiagramData = allDiagrams.find((d) => d.id === finalActiveId);
      if (activeDiagramData) {
        isLoadingRef.current = true;
        optionsRef.current.loadDiagram({
          components: activeDiagramData.components,
          connections: activeDiagramData.connections,
          frames: activeDiagramData.frames,
        });
        optionsRef.current.setTransform(activeDiagramData.viewport);
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 0);
      }

      setIsLoadingState(false);
    }

    // After setting localStorage state, fetch from API and reconcile
    // (auth state may not be known yet; the fetch will return 401 for anonymous users)
    fetch('/api/diagrams')
      .then((res) => {
        if (!res.ok) return null; // 401 = anonymous user; keep localStorage data
        return res.json() as Promise<DiagramSchema[]>;
      })
      .then((serverDiagrams) => {
        if (!serverDiagrams) {
          // 401 anonymous — keep localStorage as-is, unblock UI
          setIsLoadingState(false);
          return;
        }

        if (serverDiagrams.length === 0) {
          // Authenticated user with no diagrams on server yet (first sign-in or
          // signed in after signing out with no prior data). Promote local diagram
          // if one exists, otherwise unblock the zero-state.
          const localDiagram = diagramsRef.current[0];
          if (!localDiagram) {
            setIsLoadingState(false);
            return;
          }
          fetch('/api/diagrams', {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify(localDiagram),
          })
            .then((res) => (res.ok ? (res.json() as Promise<DiagramSchema>) : null))
            .then((created) => {
              if (!created) { setIsLoadingState(false); return; }
              const canonical: DiagramSchema = { ...localDiagram, id: created.id };
              activeDiagramIdRef.current = canonical.id;
              writeAllDiagrams([canonical]);
              writeActiveDiagramId(canonical.id);
              writeOpenTabIds([canonical.id]);
              setDiagrams([canonical]);
              setActiveDiagramId(canonical.id);
              setOpenTabIds([canonical.id]);
              setIsLoadingState(false);
            })
            .catch((err) => {
              console.error('[useDiagrams] first-login POST error:', err);
              setIsLoadingState(false);
            });
          return;
        }

        // Overwrite in-memory state with server list
        writeAllDiagrams(serverDiagrams);
        setDiagrams(serverDiagrams);
        setIsLoadingState(false);

        // Persist valid open tabs from server diagrams
        const serverIds = new Set(serverDiagrams.map((d) => d.id));
        const validTabs = finalTabs.filter((id) => serverIds.has(id));
        const reconciledTabs = validTabs.length > 0 ? validTabs : serverDiagrams.map((d) => d.id);
        const reconciledActiveId = finalActiveId && serverIds.has(finalActiveId)
          ? finalActiveId
          : (reconciledTabs[0] as string);

        setOpenTabIds(reconciledTabs);
        setActiveDiagramId(reconciledActiveId);
        // Also write directly to the ref so performSave uses the correct server
        // cuid immediately — React state won't flush until the next render, and
        // the auto-save debounce can fire before that flush completes.
        activeDiagramIdRef.current = reconciledActiveId;
        writeOpenTabIds(reconciledTabs);
        writeActiveDiagramId(reconciledActiveId);

        // Also replace the stale localStorage UUID entries with server cuids
        writeAllDiagrams(serverDiagrams);

        // Reload canvas with the reconciled active diagram
        const reconciledDiagram = serverDiagrams.find((d) => d.id === reconciledActiveId);
        if (reconciledDiagram) {
          isLoadingRef.current = true;
          optionsRef.current.loadDiagram({
            components: reconciledDiagram.components,
            connections: reconciledDiagram.connections,
            frames: reconciledDiagram.frames,
          });
          optionsRef.current.setTransform(reconciledDiagram.viewport);
          setTimeout(() => {
            isLoadingRef.current = false;
          }, 0);
        }
      })
      .catch((err) => {
        console.error('[useDiagrams] initial fetch error:', err);
        setIsLoadingState(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namespaceReady]); // runs once when namespace is confirmed (flips from false → true exactly once)

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

    // If authenticated, sync to API first and use server id
    if (isAuthenticatedRef.current) {
      fetch('/api/diagrams', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify(newDiagram),
      })
        .then((res) => {
          if (res.status === 403) {
            optionsRef.current.onUpgradeRequired?.();
            return null;
          }
          if (!res.ok) return null;
          return res.json() as Promise<DiagramSchema>;
        })
        .then((serverDiagram) => {
          if (!serverDiagram) return;

          // Use server-assigned id
          const canonical: DiagramSchema = { ...newDiagram, id: serverDiagram.id };
          writeDiagram(canonical);

          setDiagrams((prev) => [...prev, canonical]);
          setOpenTabIds((prev) => {
            const updated = [...prev, canonical.id];
            writeOpenTabIds(updated);
            return updated;
          });

          isLoadingRef.current = true;
          optionsRef.current.loadDiagram({ components: [], connections: [], frames: [] });
          optionsRef.current.setTransform(canonical.viewport);
          setTimeout(() => { isLoadingRef.current = false; }, 0);

          setActiveDiagramId(canonical.id);
          writeActiveDiagramId(canonical.id);
          setIsDirty(false);
        })
        .catch((err) => {
          console.error('[useDiagrams] openNewDiagram API error:', err);
        });
      return;
    }

    // Anonymous path: localStorage only
    writeDiagram(newDiagram);

    setDiagrams((prev) => [...prev, newDiagram]);
    setOpenTabIds((prev) => {
      const updated = [...prev, newDiagram.id];
      writeOpenTabIds(updated);
      return updated;
    });

    isLoadingRef.current = true;
    optionsRef.current.loadDiagram({ components: [], connections: [], frames: [] });
    optionsRef.current.setTransform(newDiagram.viewport);
    setTimeout(() => { isLoadingRef.current = false; }, 0);

    setActiveDiagramId(newDiagram.id);
    writeActiveDiagramId(newDiagram.id);
    setIsDirty(false);
  }, [performSave]);

  // --- openFromTemplate ---

  const openFromTemplate = useCallback(
    (components: PlacedComponent[], connections: Connection[], frames: Frame[]) => {
      if (activeDiagramIdRef.current) performSave();

      const name = computeNextUntitledName(diagramsRef.current);
      const newDiagram: DiagramSchema = {
        ...createBlankDiagram(name),
        components,
        connections,
        frames,
      };

      if (isAuthenticatedRef.current) {
        fetch('/api/diagrams', {
          method: 'POST',
          headers: JSON_HEADERS,
          body: JSON.stringify(newDiagram),
        })
          .then(async (res) => {
            if (res.status === 403) { optionsRef.current.onUpgradeRequired?.(); return; }
            const serverDiagram: DiagramSchema | null = res.ok
              ? (await res.json() as DiagramSchema)
              : null;
            // On non-403 failure fall back to localStorage-only so the user
            // isn't stranded on the zero-state with no feedback.
            const canonical: DiagramSchema = serverDiagram
              ? { ...newDiagram, id: serverDiagram.id }
              : newDiagram;
            writeDiagram(canonical);
            setDiagrams((prev) => [...prev, canonical]);
            setOpenTabIds((prev) => { const updated = [...prev, canonical.id]; writeOpenTabIds(updated); return updated; });
            isLoadingRef.current = true;
            optionsRef.current.loadDiagram({ components: canonical.components, connections: canonical.connections, frames: canonical.frames });
            optionsRef.current.setTransform(canonical.viewport);
            setTimeout(() => { isLoadingRef.current = false; }, 0);
            setActiveDiagramId(canonical.id);
            writeActiveDiagramId(canonical.id);
            setIsDirty(false);
          })
          .catch((err) => {
            console.error('[useDiagrams] openFromTemplate API error:', err);
            // Network failure — open locally so the user isn't stuck
            writeDiagram(newDiagram);
            setDiagrams((prev) => [...prev, newDiagram]);
            setOpenTabIds((prev) => { const updated = [...prev, newDiagram.id]; writeOpenTabIds(updated); return updated; });
            isLoadingRef.current = true;
            optionsRef.current.loadDiagram({ components: newDiagram.components, connections: newDiagram.connections, frames: newDiagram.frames });
            optionsRef.current.setTransform(newDiagram.viewport);
            setTimeout(() => { isLoadingRef.current = false; }, 0);
            setActiveDiagramId(newDiagram.id);
            writeActiveDiagramId(newDiagram.id);
            setIsDirty(false);
          });
        return;
      }

      // Anonymous path
      writeDiagram(newDiagram);
      setDiagrams((prev) => [...prev, newDiagram]);
      setOpenTabIds((prev) => { const updated = [...prev, newDiagram.id]; writeOpenTabIds(updated); return updated; });
      isLoadingRef.current = true;
      optionsRef.current.loadDiagram({ components: newDiagram.components, connections: newDiagram.connections, frames: newDiagram.frames });
      optionsRef.current.setTransform(newDiagram.viewport);
      setTimeout(() => { isLoadingRef.current = false; }, 0);
      setActiveDiagramId(newDiagram.id);
      writeActiveDiagramId(newDiagram.id);
      setIsDirty(false);
    },
    [performSave]
  );

  // --- closeTab ---

  const closeTab = useCallback(
    (id: string) => {
      performSave();

      const currentDiagrams = diagramsRef.current;
      const currentTabs = openTabIdsRef.current;
      const currentActiveId = activeDiagramIdRef.current;

      // If this is the only diagram, delete it and return to zero-state
      if (currentDiagrams.length === 1) {
        deleteDiagram(id);
        if (isAuthenticatedRef.current) {
          fetch(`/api/diagrams/${id}`, { method: 'DELETE' }).catch((err) => {
            console.error('[useDiagrams] closeTab DELETE error:', err);
          });
        }

        setDiagrams([]);
        setOpenTabIds([]);
        setActiveDiagramId('');
        setIsDirty(false);
        return;
      }

      const isActiveTab = id === currentActiveId;
      const tabIndex = currentTabs.indexOf(id);
      const newTabs = currentTabs.filter((t) => t !== id);

      if (!isActiveTab) {
        deleteDiagram(id);
        if (isAuthenticatedRef.current) {
          fetch(`/api/diagrams/${id}`, { method: 'DELETE' }).catch((err) => {
            console.error('[useDiagrams] closeTab DELETE error:', err);
          });
        }
        setDiagrams((prev) => prev.filter((d) => d.id !== id));
        setOpenTabIds(newTabs);
        writeOpenTabIds(newTabs);
        return;
      }

      // Active tab being closed — switch to neighbor first
      const neighborId =
        tabIndex > 0
          ? currentTabs[tabIndex - 1]
          : currentTabs[tabIndex + 1];

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
          setTimeout(() => { isLoadingRef.current = false; }, 0);
        }
        setActiveDiagramId(neighborId);
        writeActiveDiagramId(neighborId);
      }

      deleteDiagram(id);
      if (isAuthenticatedRef.current) {
        fetch(`/api/diagrams/${id}`, { method: 'DELETE' }).catch((err) => {
          console.error('[useDiagrams] closeTab DELETE error:', err);
        });
      }
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

    if (isAuthenticatedRef.current) {
      fetch(`/api/diagrams/${id}`, {
        method: 'PUT',
        headers: JSON_HEADERS,
        body: JSON.stringify({
          name,
          components: updated.components,
          connections: updated.connections,
          frames: updated.frames,
          viewport: updated.viewport,
        }),
      }).catch((err) => {
        console.error('[useDiagrams] renameDiagram API error:', err);
      });
    }
  }, []);

  // --- reorderTabs ---

  const reorderTabs = useCallback((newOrder: string[]) => {
    const current = openTabIdsRef.current;
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
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    }
    setSaveModeState(mode);
    writeSaveMode(mode);
  }, []);

  // --- manualSave ---

  const manualSave = useCallback((): Promise<void> => {
    return performSave();
  }, [performSave]);

  // --- Computed values ---

  const activeDiagram = diagrams.find((d) => d.id === activeDiagramId) ?? null;

  return {
    diagrams,
    activeDiagramId,
    openTabIds,
    saveMode,
    isDirty,
    isLoading,
    isSaving,
    lastSavedAt,
    activeDiagram,
    switchToDiagram,
    openNewDiagram,
    openFromTemplate,
    closeTab,
    renameDiagram,
    reorderTabs,
    setSaveMode,
    manualSave,
    notifyStateChanged,
  };
}
