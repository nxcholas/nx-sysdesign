import type { EntityRelationData, EntityRelationRow, RowKeyType } from './types';

/** Create a default table seed used when a user drops a new Entity Relation table. */
export function createDefaultTableData(): EntityRelationData {
  return {
    header: 'Table',
    rows: [
      { id: crypto.randomUUID(), name: 'UniqueID', keyType: 'PK' },
      { id: crypto.randomUUID(), name: 'Row 1', keyType: 'none' },
      { id: crypto.randomUUID(), name: 'Row 2', keyType: 'none' },
      { id: crypto.randomUUID(), name: 'Row 3', keyType: 'none' },
    ],
  };
}

/**
 * Cycle the key type for a row: none → PK → FK → none.
 * Only one PK is allowed at a time — cycling a row to PK clears any other PK.
 * Multiple FK rows are allowed.
 */
export function cycleKeyType(rows: EntityRelationRow[], rowId: string): EntityRelationRow[] {
  const target = rows.find((r) => r.id === rowId);
  if (!target) return rows;
  const order: RowKeyType[] = ['none', 'PK', 'FK'];
  const next: RowKeyType = order[(order.indexOf(target.keyType) + 1) % order.length] ?? 'none';
  return rows.map((r) => {
    if (r.id === rowId) return { ...r, keyType: next };
    // Only one PK allowed — if cycling to PK, clear all others from PK
    if (next === 'PK' && r.keyType === 'PK') return { ...r, keyType: 'none' };
    return r;
  });
}

/** Append a new empty row. */
export function addRow(
  rows: EntityRelationRow[],
  rowId: string = crypto.randomUUID(),
  name: string = ''
): EntityRelationRow[] {
  return [...rows, { id: rowId, name, keyType: 'none' }];
}

/**
 * Remove a row. Refuses to remove the last remaining row if it is PK
 * (returns the original array unchanged so callers can detect the no-op).
 */
export function removeRow(rows: EntityRelationRow[], rowId: string): EntityRelationRow[] {
  const target = rows.find((r) => r.id === rowId);
  if (!target) return rows;
  if (rows.length === 1 && target.keyType === 'PK') return rows;
  return rows.filter((r) => r.id !== rowId);
}

/** Rename a row. */
export function renameRow(
  rows: EntityRelationRow[],
  rowId: string,
  name: string
): EntityRelationRow[] {
  return rows.map((r) => (r.id === rowId ? { ...r, name } : r));
}
