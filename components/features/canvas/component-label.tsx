'use client';

import { useState, useRef, useEffect } from 'react';

interface ComponentLabelProps {
  label: string;
  onRename: (newLabel: string) => void;
}

export function ComponentLabel({ label, onRename }: ComponentLabelProps) {
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
        className="text-xs font-mono bg-transparent border-b border-blue-400 outline-none text-gray-200 w-24 max-w-full min-w-0 text-center"
      />
    );
  }

  return (
    <span
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className="text-xs font-mono select-none cursor-text text-gray-300 text-center leading-tight text-nowrap"
    >
      {label}
    </span>
  );
}
