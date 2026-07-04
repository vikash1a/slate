import { useState } from 'react';
import type { PropertyValue } from '@/types';

interface TextCellProps {
  value: PropertyValue;
  onChange: (value: string) => void;
}

export default function TextCell({ value, onChange }: TextCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ''));

  const handleBlur = () => {
    setEditing(false);
    onChange(draft);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setDraft(String(value ?? ''));
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <input
        className="cell-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    );
  }

  return (
    <div className="cell-display" onClick={() => { setDraft(String(value ?? '')); setEditing(true); }}>
      {value ? String(value) : <span className="cell-empty">Empty</span>}
    </div>
  );
}
