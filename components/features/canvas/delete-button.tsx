'use client';

interface DeleteButtonProps {
  onDelete: () => void;
  scale: number;
}

export function DeleteButton({ onDelete, scale }: DeleteButtonProps) {
  const size = 20 / scale;
  const iconSize = 10 / scale;

  return (
    <button
      type="button"
      aria-label="Delete component"
      onPointerDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      style={{
        position: 'absolute',
        top: -size - 6 / scale,
        right: -10,
        width: size,
        height: size,
        zIndex: 999,
      }}
      className="flex items-center justify-center rounded-full bg-red-600 hover:bg-red-500
        text-white shadow-md transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 10 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <line x1="2" y1="2" x2="8" y2="8" />
        <line x1="8" y1="2" x2="2" y2="8" />
      </svg>
    </button>
  );
}
