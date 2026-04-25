'use client';

import React, { useState } from 'react';
import * as htmlToImage from 'html-to-image';
import type { PlacedComponent, Frame, CanvasTransform } from '@/lib/types';

interface ExportButtonProps {
  exportLayerRef: React.RefObject<HTMLDivElement | null>;
  placedComponents: PlacedComponent[];
  frames: Frame[];
  diagramName: string;
  transform: CanvasTransform;
}

function computeExportBounds(
  placedComponents: PlacedComponent[],
  frames: Frame[],
  padding = 32
): { x: number; y: number; width: number; height: number } | null {
  const all: Array<{ x: number; y: number; width: number; height: number }> = [
    ...placedComponents,
    ...frames,
  ];
  if (all.length === 0) return null;

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (const r of all) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.width);
    maxY = Math.max(maxY, r.y + r.height);
  }

  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
}

export function ExportButton({
  exportLayerRef,
  placedComponents,
  frames,
  diagramName,
  transform,
}: ExportButtonProps): React.ReactElement {
  const [isExporting, setIsExporting] = useState(false);

  const isEmpty = placedComponents.length === 0 && frames.length === 0;

  async function handleExport() {
    if (isExporting || isEmpty) return;
    const el = exportLayerRef.current;
    if (!el) return;

    const bounds = computeExportBounds(placedComponents, frames, 32);
    if (!bounds) return;

    setIsExporting(true);
    try {
      const { x: bx, y: by, width: bw, height: bh } = bounds;
      const { scale: S, translateX: TX, translateY: TY } = transform;

      // Convert canvas-space bounding box to screen-space pixels
      // (the export layer is inset:0 with no CSS transform — coordinates are screen pixels)
      const screenMinX = bx * S + TX;
      const screenMinY = by * S + TY;
      const screenW = bw * S;
      const screenH = bh * S;

      // Clamp output to 8192px max to stay within browser canvas limits
      const clamp = Math.min(1, 8192 / Math.max(screenW, screenH, 1));
      const finalW = Math.ceil(screenW * clamp);
      const finalH = Math.ceil(screenH * clamp);

      // Shift the layer so the bounding box top-left aligns to (0,0) in the output
      const dataUrl = await htmlToImage.toPng(el, {
        width: finalW,
        height: finalH,
        style: {
          transform: `translate(${-screenMinX * clamp}px, ${-screenMinY * clamp}px) scale(${clamp})`,
          transformOrigin: '0 0',
        },
        pixelRatio: window.devicePixelRatio ?? 2,
      });

      const safeName = diagramName
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 64);
      const date = new Date().toISOString().slice(0, 10);

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `sysdesign-${safeName}-${date}.png`;
      link.click();
    } catch {
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleExport()}
      disabled={isExporting || isEmpty}
      aria-label="Export diagram as PNG"
      title={isEmpty ? 'Add components to export' : 'Export as PNG'}
      className={[
        'px-2.5 py-1 rounded text-xs font-mono',
        'border transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'cursor-pointer',
        'text-gray-400 border-gray-700 hover:text-gray-200 hover:border-gray-600',
      ].join(' ')}
    >
      {isExporting ? (
        <span className="flex items-center gap-1.5">
          <span
            role="status"
            aria-label="Exporting…"
            className="inline-block w-3 h-3 rounded-full border-2 border-gray-700 border-t-blue-400 animate-spin"
          />
          Exporting…
        </span>
      ) : (
        'Export PNG'
      )}
    </button>
  );
}
