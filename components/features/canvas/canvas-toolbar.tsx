'use client';

import { useState } from 'react';
import type { CanvasTool, ShapeKind } from '@/lib/types';
import { Tooltip } from '@/components/ui/tooltip';
import { ShapePickerPopover } from './shape-picker-popover';

interface CanvasToolbarProps {
  activeTool: CanvasTool;
  onToolChange: (tool: CanvasTool) => void;
  onShapeSelect: (shape: ShapeKind) => void;
  flowVisible: boolean;
  onFlowToggle: () => void;
}

function CursorIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2l4.5 12 1.8-4.7L14 7.5z" />
      <path d="M10 10l3.5 3.5" />
    </svg>
  );
}

function HandIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5v7M5.5 3.5v5M10.5 3.5v5M3 6.5v4c0 3 2 4.5 5 4.5s5-1.5 5-4.5v-3" />
      <path d="M13 7.5V5.5" />
    </svg>
  );
}

function FrameIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="12" height="10" rx="1.5" strokeDasharray="3 2" />
      <line x1="5" y1="4" x2="5" y2="2" />
      <line x1="5" y1="2" x2="11" y2="2" />
      <line x1="11" y1="2" x2="11" y2="4" />
    </svg>
  );
}

function TextBlockIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="4" x2="14" y2="4" />
      <line x1="8" y1="4" x2="8" y2="13" />
    </svg>
  );
}

function ShapeIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="8,2 14,14 2,14" />
    </svg>
  );
}

function DataFlowIcon({ active }: { active: boolean }) {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16">
      {active ? (
        <circle cx="8" cy="8" r="5" fill="currentColor" />
      ) : (
        <circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth={1.5} />
      )}
    </svg>
  );
}

export function CanvasToolbar({ activeTool, onToolChange, onShapeSelect, flowVisible, onFlowToggle }: CanvasToolbarProps) {
  const [shapePopoverOpen, setShapePopoverOpen] = useState(false);

  const btnBase =
    'flex items-center justify-center w-8 h-8 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  const btnActive = 'bg-blue-600/20 text-blue-400';
  const btnInactive = 'text-gray-400 hover:text-gray-200 hover:bg-panel-hover';

  const handleShapeButtonClick = () => {
    if (activeTool === 'shape') {
      setShapePopoverOpen((prev) => !prev);
    } else {
      setShapePopoverOpen(true);
    }
  };

  const handleShapeSelect = (shape: ShapeKind) => {
    onShapeSelect(shape);
    onToolChange('shape');
    setShapePopoverOpen(false);
  };

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-panel-bg border border-panel-border rounded-lg px-1.5 py-1 shadow-lg"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Tooltip content={<>Select <kbd className="ml-1 px-1 rounded bg-gray-700 text-[10px] font-mono">V</kbd></>}>
        <button
          type="button"
          aria-label="Select tool"
          className={`${btnBase} ${activeTool === 'select' ? btnActive : btnInactive}`}
          onClick={() => onToolChange('select')}
        >
          <CursorIcon />
        </button>
      </Tooltip>

      <div className="w-px h-5 bg-panel-border" />

      <Tooltip content={<>Frame <kbd className="ml-1 px-1 rounded bg-gray-700 text-[10px] font-mono">F</kbd></>}>
        <button
          type="button"
          aria-label="Frame tool"
          className={`${btnBase} ${activeTool === 'frame' ? btnActive : btnInactive}`}
          onClick={() => onToolChange('frame')}
        >
          <FrameIcon />
        </button>
      </Tooltip>

      <Tooltip content={<>Text Block <kbd className="ml-1 px-1 rounded bg-gray-700 text-[10px] font-mono">T</kbd></>}>
        <button
          type="button"
          aria-label="Text block tool"
          className={`${btnBase} ${activeTool === 'text-block' ? btnActive : btnInactive}`}
          onClick={() => onToolChange('text-block')}
        >
          <TextBlockIcon />
        </button>
      </Tooltip>

      <div className="relative">
        <Tooltip content={<>Shape <kbd className="ml-1 px-1 rounded bg-gray-700 text-[10px] font-mono">U</kbd></>}>
          <button
            type="button"
            aria-label="Shape tool"
            className={`${btnBase} ${activeTool === 'shape' ? btnActive : btnInactive}`}
            onClick={handleShapeButtonClick}
          >
            <ShapeIcon />
          </button>
        </Tooltip>

        {shapePopoverOpen && (
          <ShapePickerPopover
            onSelect={handleShapeSelect}
            onClose={() => setShapePopoverOpen(false)}
          />
        )}
      </div>

      <Tooltip content={<>Pan <kbd className="ml-1 px-1 rounded bg-gray-700 text-[10px] font-mono">Ctrl</kbd> <kbd className="px-1 rounded bg-gray-700 text-[10px] font-mono">Middle Click</kbd></>}>
        <button
          type="button"
          aria-label="Pan tool"
          className={`${btnBase} ${activeTool === 'pan' ? btnActive : btnInactive}`}
          onClick={() => onToolChange('pan')}
        >
          <HandIcon />
        </button>
      </Tooltip>

      <div className="w-px h-5 bg-panel-border" />

      <Tooltip content={<>Data flow <kbd className="ml-1 px-1 rounded bg-gray-700 text-[10px] font-mono">A</kbd></>}>
        <button
          type="button"
          aria-label="Toggle data flow"
          aria-pressed={flowVisible}
          className={`${btnBase} ${flowVisible ? btnActive : btnInactive}`}
          onClick={onFlowToggle}
        >
          {flowVisible ? (
            <span className="animate-pulse">
              <DataFlowIcon active={true} />
            </span>
          ) : (
            <DataFlowIcon active={false} />
          )}
        </button>
      </Tooltip>
    </div>
  );
}
