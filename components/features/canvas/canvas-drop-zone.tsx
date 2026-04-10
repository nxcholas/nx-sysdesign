'use client';

interface CanvasDropZoneProps {
  isDragOver: boolean;
}

export function CanvasDropZone({ isDragOver }: CanvasDropZoneProps) {
  if (!isDragOver) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
      }}
      className="ring-2 ring-blue-500 ring-inset"
    />
  );
}