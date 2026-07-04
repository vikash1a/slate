import { useState, useRef, useEffect } from 'react';
import type { PropertyValue, SelectOption } from '@/types';

interface SelectCellProps {
  value: PropertyValue;
  options: SelectOption[];
  onChange: (value: string) => void;
}

const colorMap: Record<string, string> = {
  red: '#fee2e2',
  orange: '#ffedd5',
  yellow: '#fef9c3',
  green: '#dcfce7',
  blue: '#dbeafe',
  purple: '#f3e8ff',
  pink: '#fce7f3',
  gray: '#f3f4f6',
};

const colorTextMap: Record<string, string> = {
  red: '#991b1b',
  orange: '#9a3412',
  yellow: '#854d0e',
  green: '#166534',
  blue: '#1e40af',
  purple: '#6b21a8',
  pink: '#9d174d',
  gray: '#374151',
};

export default function SelectCell({ value, options, onChange }: SelectCellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selectedOption = options.find((o) => o.name === value);

  return (
    <div className="cell-select-wrapper" ref={ref}>
      <div className="cell-display" onClick={() => setOpen(!open)}>
        {selectedOption ? (
          <span
            className="select-tag"
            style={{
              background: colorMap[selectedOption.color] || colorMap.gray,
              color: colorTextMap[selectedOption.color] || colorTextMap.gray,
            }}
          >
            {selectedOption.name}
          </span>
        ) : (
          <span className="cell-empty">Empty</span>
        )}
      </div>

      {open && (
        <div className="cell-select-dropdown">
          {value && (
            <div
              className="cell-select-option"
              onClick={() => { onChange(''); setOpen(false); }}
            >
              <span className="cell-empty">Clear</span>
            </div>
          )}
          {options.map((opt) => (
            <div
              key={opt.id}
              className="cell-select-option"
              onClick={() => { onChange(opt.name); setOpen(false); }}
            >
              <span
                className="select-tag"
                style={{
                  background: colorMap[opt.color] || colorMap.gray,
                  color: colorTextMap[opt.color] || colorTextMap.gray,
                }}
              >
                {opt.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
