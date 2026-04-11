'use client';

import { useState, useRef, useEffect } from 'react';

interface FrameLabelProps {
  label: string;
  onRename: (newLabel: string) => void;
}

export function FrameLabel({ label, onRename }: FrameLabelProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  // Keep draft in sync if label changes externally
  useEffect(() => {
    if (!editing) setDraft(label);
  }, [label, editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== label) {
      onRename(trimmed);
    } else {
      setDraft(label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') {
      setDraft(label);
      setEditing(false);
    }
    e.stopPropagation();
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="text-xs font-mono bg-transparent border-b border-blue-400 outline-none text-blue-500 w-32 min-w-0"
      />
    );
  }

  return (
    <span
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      className="text-xs font-mono select-none cursor-text text-blue-500 text-nowrap"
    >
      {label}
    </span>
  );
}
