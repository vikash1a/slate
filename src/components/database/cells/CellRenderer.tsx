import type { PropertyDefinition, PropertyValue } from '@/types';
import TextCell from './TextCell';
import NumberCell from './NumberCell';
import SelectCell from './SelectCell';
import MultiSelectCell from './MultiSelectCell';
import DateCell from './DateCell';
import CheckboxCell from './CheckboxCell';

interface CellRendererProps {
  property: PropertyDefinition;
  value: PropertyValue;
  onChange: (value: PropertyValue) => void;
}

export default function CellRenderer({ property, value, onChange }: CellRendererProps) {
  switch (property.type) {
    case 'text':
    case 'url':
    case 'email':
    case 'phone':
      return <TextCell value={value} onChange={onChange} />;

    case 'number':
      return <NumberCell value={value} onChange={onChange} />;

    case 'select':
      return (
        <SelectCell
          value={value}
          options={property.options || []}
          onChange={onChange}
        />
      );

    case 'multi_select':
      return (
        <MultiSelectCell
          value={value}
          options={property.options || []}
          onChange={onChange}
        />
      );

    case 'date':
      return <DateCell value={value} onChange={onChange} />;

    case 'checkbox':
      return (
        <CheckboxCell
          value={value}
          onChange={onChange}
        />
      );

    case 'created_time':
    case 'updated_time':
      return (
        <div className="cell-display cell-readonly">
          {value && typeof value === 'object' && value !== null && 'toDate' in value
            ? (value as { toDate: () => Date }).toDate().toLocaleDateString()
            : String(value ?? '—')}
        </div>
      );

    default:
      return <TextCell value={value} onChange={onChange} />;
  }
}
