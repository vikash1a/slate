import type { PropertyValue } from '@/types';

interface CheckboxCellProps {
  value: PropertyValue;
  onChange: (value: boolean) => void;
}

export default function CheckboxCell({ value, onChange }: CheckboxCellProps) {
  const checked = value === true;

  return (
    <div
      className="cell-display cell-checkbox"
      onClick={() => onChange(!checked)}
    >
      <span className={`checkbox-icon ${checked ? 'checked' : ''}`}>
        {checked ? '☑' : '☐'}
      </span>
    </div>
  );
}
