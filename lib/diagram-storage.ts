// Pure localStorage utilities — no React imports.
// All reads return safe defaults on missing or corrupt data.
// All writes swallow QuotaExceededError silently.

import type { DiagramSchema, SaveMode } from '@/lib/types';

// --- Storage key constants ---

export const STORAGE_KEY_DIAGRAMS  = 'sysdesign:diagrams';
export const STORAGE_KEY_ACTIVE_ID = 'sysdesign:activeDiagramId';
export const STORAGE_KEY_OPEN_TABS = 'sysdesign:openTabIds';
export const STORAGE_KEY_SAVE_MODE = 'sysdesign:saveMode';

// --- Availability guard (cached at module scope) ---

let _lsAvailable: boolean | null = null;

function isLocalStorageAvailable(): boolean {
  if (_lsAvailable !== null) return _lsAvailable;
  try {
    const probe = '__ls_probe__';
    localStorage.setItem(probe, probe);
    localStorage.removeItem(probe);
    _lsAvailable = true;
  } catch {
    _lsAvailable = false;
  }
  return _lsAvailable;
}

// --- Safe read / write helpers ---

function safeGetItem(key: string): string | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Swallow QuotaExceededError and other write failures silently.
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function safeRemoveItem(key: string): void {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Swallow silently.
  }
}

// --- Reads ---

export function readAllDiagrams(): DiagramSchema[] {
  const raw = safeGetItem(STORAGE_KEY_DIAGRAMS);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as DiagramSchema[];
  } catch {
    return [];
  }
}

export function readActiveDiagramId(): string | null {
  return safeGetItem(STORAGE_KEY_ACTIVE_ID);
}

export function readOpenTabIds(): string[] {
  const raw = safeGetItem(STORAGE_KEY_OPEN_TABS);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as string[];
  } catch {
    return [];
  }
}

export function readSaveMode(): SaveMode {
  const raw = safeGetItem(STORAGE_KEY_SAVE_MODE);
  if (raw === 'manual') return 'manual';
  return 'auto';
}

// --- Writes ---

export function writeAllDiagrams(diagrams: DiagramSchema[]): void {
  safeSetItem(STORAGE_KEY_DIAGRAMS, JSON.stringify(diagrams));
}

export function writeActiveDiagramId(id: string): void {
  safeSetItem(STORAGE_KEY_ACTIVE_ID, id);
}

export function writeOpenTabIds(ids: string[]): void {
  safeSetItem(STORAGE_KEY_OPEN_TABS, JSON.stringify(ids));
}

export function writeSaveMode(mode: SaveMode): void {
  safeSetItem(STORAGE_KEY_SAVE_MODE, mode);
}

// --- Single-diagram operations ---

export function writeDiagram(diagram: DiagramSchema): void {
  const all = readAllDiagrams();
  const idx = all.findIndex((d) => d.id === diagram.id);
  if (idx >= 0) {
    all[idx] = diagram;
  } else {
    all.push(diagram);
  }
  writeAllDiagrams(all);
}

export function deleteDiagram(id: string): void {
  const all = readAllDiagrams().filter((d) => d.id !== id);
  writeAllDiagrams(all);
}

export function readDiagram(id: string): DiagramSchema | null {
  return readAllDiagrams().find((d) => d.id === id) ?? null;
}

// --- Factory ---

export function createBlankDiagram(name: string): DiagramSchema {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    components: [],
    connections: [],
    frames: [],
    viewport: { scale: 1, translateX: 0, translateY: 0 },
  };
}

export function computeNextUntitledName(diagrams: DiagramSchema[]): string {
  // Find the highest N among names matching "Untitled Diagram <N>"
  let max = 0;
  const pattern = /^Untitled Diagram (\d+)$/;
  for (const d of diagrams) {
    const match = pattern.exec(d.name);
    if (match && match[1] !== undefined) {
      const n = parseInt(match[1], 10);
      if (n > max) max = n;
    }
  }
  return `Untitled Diagram ${max + 1}`;
}
