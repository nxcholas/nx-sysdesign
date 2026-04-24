// Pure localStorage utilities — no React imports.
// All reads return safe defaults on missing or corrupt data.
// All writes swallow QuotaExceededError silently.
//
// Keys are namespaced per user: `sysdesign:user_<id>:<key>` for authenticated
// users and `sysdesign:anon:<key>` for anonymous visitors. Call
// setStorageNamespace() once the auth session is known before reading or
// writing anything.

import type { DiagramSchema, SaveMode } from '@/lib/types';

// --- Namespace management ---

let _namespace = 'sysdesign:anon';

export function setStorageNamespace(ns: string): void {
  _namespace = ns;
}

export function clearCurrentNamespace(): void {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.removeItem(`${_namespace}:diagrams`);
    localStorage.removeItem(`${_namespace}:activeDiagramId`);
    localStorage.removeItem(`${_namespace}:openTabIds`);
    localStorage.removeItem(`${_namespace}:saveMode`);
  } catch {
    // Swallow silently.
  }
}

// --- Storage key helpers (dynamic, namespace-aware) ---

function keyDiagrams()  { return `${_namespace}:diagrams`; }
function keyActiveId()  { return `${_namespace}:activeDiagramId`; }
function keyOpenTabs()  { return `${_namespace}:openTabIds`; }
function keySaveMode()  { return `${_namespace}:saveMode`; }

// Legacy named exports kept for any external consumers — point at anon namespace.
export const STORAGE_KEY_DIAGRAMS  = 'sysdesign:anon:diagrams';
export const STORAGE_KEY_ACTIVE_ID = 'sysdesign:anon:activeDiagramId';
export const STORAGE_KEY_OPEN_TABS = 'sysdesign:anon:openTabIds';
export const STORAGE_KEY_SAVE_MODE = 'sysdesign:anon:saveMode';

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
  const raw = safeGetItem(keyDiagrams());
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
  return safeGetItem(keyActiveId());
}

export function readOpenTabIds(): string[] {
  const raw = safeGetItem(keyOpenTabs());
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
  const raw = safeGetItem(keySaveMode());
  if (raw === 'manual') return 'manual';
  return 'auto';
}

// --- Writes ---

export function writeAllDiagrams(diagrams: DiagramSchema[]): void {
  safeSetItem(keyDiagrams(), JSON.stringify(diagrams));
}

export function writeActiveDiagramId(id: string): void {
  safeSetItem(keyActiveId(), id);
}

export function writeOpenTabIds(ids: string[]): void {
  safeSetItem(keyOpenTabs(), JSON.stringify(ids));
}

export function writeSaveMode(mode: SaveMode): void {
  safeSetItem(keySaveMode(), mode);
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

// Keep safeRemoveItem referenced to avoid lint unused warning.
void safeRemoveItem;
