import { useState, useRef, useEffect } from 'react';
import type { PropertyValue, SelectOption } from '@/types';

interface MultiSelectCellProps {
  value: PropertyValue;
  options: SelectOption[];
  onChange: (value: string[]) => void;
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

export default function MultiSelectCell({ value, options, onChange }: MultiSelectCellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = Array.isArray(value) ? value : [];

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

  const toggleOption = (optName: string) => {
    if (selected.includes(optName)) {
      onChange(selected.filter((s) => s !== optName));
    } else {
      onChange([...selected, optName]);
    }
  };

  return (
    <div className="cell-select-wrapper" ref={ref}>
      <div className="cell-display cell-multi-display" onClick={() => setOpen(!open)}>
        {selected.length > 0 ? (
          <div className="multi-tags">
            {selected.map((val) => {
              const opt = options.find((o) => o.name === val);
              return (
                <span
                  key={val}
                  className="select-tag select-tag-sm"
                  style={{
                    background: colorMap[opt?.color || 'gray'] || colorMap.gray,
                    color: colorTextMap[opt?.color || 'gray'] || colorTextMap.gray,
                  }}
                >
                  {val}
                </span>
              );
            })}
          </div>
        ) : (
          <span className="cell-empty">Empty</span>
        )}
      </div>

      {open && (
        <div className="cell-select-dropdown">
          {options.map((opt) => (
            <div
              key={opt.id}
              className="cell-select-option"
              onClick={() => toggleOption(opt.name)}
            >
              <span className="cell-checkbox-mark">
                {selected.includes(opt.name) ? '☑' : '☐'}
              </span>
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
