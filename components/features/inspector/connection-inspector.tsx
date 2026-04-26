'use client';

import type { Connection, Cardinality, CardinalityEnd } from '@/lib/types';

interface ConnectionInspectorProps {
  connection: Connection | null;
  onUpdateCardinality: (id: string, cardinality: Cardinality) => void;
  onUpdateLabel: (id: string, label: string) => void;
  onRemove: (id: string) => void;
}

const CARDINALITY_OPTIONS: { label: string; value: CardinalityEnd }[] = [
  { label: 'None',             value: { symbol: 'none' } },
  { label: 'One',              value: { symbol: 'one' } },
  { label: 'Many',             value: { symbol: 'many' } },
  { label: 'One and only one', value: { symbol: 'one-and-only-one' } },
  { label: 'Zero or one',      value: { symbol: 'zero-or-one' } },
  { label: 'One or many',      value: { symbol: 'one-or-many' } },
  { label: 'Zero or many',     value: { symbol: 'zero-or-many' } },
];

function endToKey(end: CardinalityEnd): string {
  return end.symbol;
}

function keyToEnd(key: string): CardinalityEnd {
  const found = CARDINALITY_OPTIONS.find((o) => o.value.symbol === key);
  return found?.value ?? { symbol: 'one-and-only-one' };
}

export function ConnectionInspector({
  connection,
  onUpdateCardinality,
  onUpdateLabel,
  onRemove,
}: ConnectionInspectorProps) {
  if (!connection) return null;

  const hasCardinality = connection.cardinality !== undefined;

  return (
    <div
      className="absolute top-4 right-4 z-20 bg-panel-bg border border-panel-border
        rounded-lg shadow-xl px-4 py-3 flex flex-col gap-3 min-w-64 max-w-xs pointer-events-auto"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
          {hasCardinality ? 'Relationship' : 'Connection'}
        </span>
        <button
          type="button"
          aria-label="Remove connection"
          onClick={() => onRemove(connection.id)}
          className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded
            border border-red-800 hover:border-red-600 transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          Remove
        </button>
      </div>

      {/* Label */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400" htmlFor="connection-label">
          Label
        </label>
        <input
          id="connection-label"
          type="text"
          defaultValue={connection.label ?? ''}
          key={connection.id}
          placeholder="e.g. HTTP/REST"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onUpdateLabel(connection.id, (e.target as HTMLInputElement).value.trim());
              (e.target as HTMLInputElement).blur();
            }
          }}
          onBlur={(e) => {
            onUpdateLabel(connection.id, e.target.value.trim());
          }}
          className="bg-[#1a1d24] border border-panel-border text-gray-200 text-xs rounded px-2 py-1
            placeholder-gray-600
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        />
      </div>

      {hasCardinality && connection.cardinality ? (
        <>
          {/* Source end */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400" htmlFor="cardinality-source">
              Source end
            </label>
            <select
              id="cardinality-source"
              value={endToKey(connection.cardinality.source)}
              onChange={(e) => {
                if (!connection.cardinality) return;
                onUpdateCardinality(connection.id, {
                  source: keyToEnd(e.target.value),
                  target: connection.cardinality.target,
                });
              }}
              className="bg-[#1a1d24] border border-panel-border text-gray-200 text-xs rounded px-2 py-1
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {CARDINALITY_OPTIONS.map((opt) => (
                <option key={endToKey(opt.value)} value={endToKey(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target end */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400" htmlFor="cardinality-target">
              Target end
            </label>
            <select
              id="cardinality-target"
              value={endToKey(connection.cardinality.target)}
              onChange={(e) => {
                if (!connection.cardinality) return;
                onUpdateCardinality(connection.id, {
                  source: connection.cardinality.source,
                  target: keyToEnd(e.target.value),
                });
              }}
              className="bg-[#1a1d24] border border-panel-border text-gray-200 text-xs rounded px-2 py-1
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {CARDINALITY_OPTIONS.map((opt) => (
                <option key={endToKey(opt.value)} value={endToKey(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <p className="text-xs text-gray-500 italic">Standard connection</p>
      )}
    </div>
  );
}
