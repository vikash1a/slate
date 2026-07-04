import { useState } from 'react';
import type { PropertyValue } from '@/types';

interface DateCellProps {
  value: PropertyValue;
  onChange: (value: string) => void;
}

export default function DateCell({ value, onChange }: DateCellProps) {
  const [editing, setEditing] = useState(false);

  // Convert Firestore Timestamp or string to YYYY-MM-DD
  const toDateString = (val: PropertyValue): string => {
    if (!val) return '';
    if (typeof val === 'string') {
      // Try to parse as date
      const d = new Date(val);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    }
    if (typeof val === 'object' && val !== null && 'toDate' in val) {
      return (val as { toDate: () => Date }).toDate().toISOString().split('T')[0];
    }
    return '';
  };

  const displayDate = (val: PropertyValue): string => {
    const dateStr = toDateString(val);
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (editing) {
    return (
      <input
        className="cell-input"
        type="date"
        value={toDateString(value)}
        onChange={(e) => {
          onChange(e.target.value);
          setEditing(false);
        }}
        onBlur={() => setEditing(false)}
        autoFocus
      />
    );
  }

  return (
    <div className="cell-display" onClick={() => setEditing(true)}>
      {value ? displayDate(value) : <span className="cell-empty">Empty</span>}
    </div>
  );
}
