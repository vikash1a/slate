import { useState } from 'react';
import type { PropertyValue } from '@/types';

interface NumberCellProps {
  value: PropertyValue;
  onChange: (value: number | null) => void;
}

export default function NumberCell({ value, onChange }: NumberCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value != null ? String(value) : '');

  const handleBlur = () => {
    setEditing(false);
    const num = draft === '' ? null : Number(draft);
    if (num !== null && isNaN(num)) return;
    onChange(num);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setDraft(value != null ? String(value) : '');
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <input
        className="cell-input"
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    );
  }

  return (
    <div className="cell-display" onClick={() => { setDraft(value != null ? String(value) : ''); setEditing(true); }}>
      {value != null ? String(value) : <span className="cell-empty">Empty</span>}
    </div>
  );
}
