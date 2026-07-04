import { useState } from 'react';
import type { PropertyDefinition, PropertyType, SelectOption, SelectOptionColor } from '@/types';

interface PropertyEditorProps {
  properties: Record<string, PropertyDefinition>;
  onSave: (properties: Record<string, PropertyDefinition>) => void;
  onClose: () => void;
}

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'text', label: '📝 Text' },
  { value: 'number', label: '🔢 Number' },
  { value: 'select', label: '🔘 Select' },
  { value: 'multi_select', label: '🏷️ Multi Select' },
  { value: 'date', label: '📅 Date' },
  { value: 'checkbox', label: '☑️ Checkbox' },
  { value: 'url', label: '🔗 URL' },
  { value: 'email', label: '📧 Email' },
];

const COLORS: SelectOptionColor[] = [
  'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray',
];

function generateId() {
  return 'p_' + Math.random().toString(36).slice(2, 9);
}

export default function PropertyEditor({ properties, onSave, onClose }: PropertyEditorProps) {
  const [props, setProps] = useState<Record<string, PropertyDefinition>>({ ...properties });
  const [newPropName, setNewPropName] = useState('');
  const [newPropType, setNewPropType] = useState<PropertyType>('text');

  const sortedProps = Object.entries(props).sort(([, a], [, b]) => a.order - b.order);

  const handleAddProperty = () => {
    if (!newPropName.trim()) return;
    const id = generateId();
    const newProp: PropertyDefinition = {
      name: newPropName.trim(),
      type: newPropType,
      order: Object.keys(props).length,
    };
    if (newPropType === 'select' || newPropType === 'multi_select') {
      newProp.options = [];
    }
    setProps({ ...props, [id]: newProp });
    setNewPropName('');
    setNewPropType('text');
  };

  const handleRemoveProperty = (id: string) => {
    const next = { ...props };
    delete next[id];
    setProps(next);
  };

  const handleAddOption = (propId: string) => {
    const prop = props[propId];
    if (!prop) return;
    const optionName = prompt('Option name:');
    if (!optionName?.trim()) return;
    const newOption: SelectOption = {
      id: 'o_' + Math.random().toString(36).slice(2, 9),
      name: optionName.trim(),
      color: COLORS[((prop.options?.length) || 0) % COLORS.length],
    };
    setProps({
      ...props,
      [propId]: {
        ...prop,
        options: [...(prop.options || []), newOption],
      },
    });
  };

  const handleRemoveOption = (propId: string, optId: string) => {
    const prop = props[propId];
    if (!prop) return;
    setProps({
      ...props,
      [propId]: {
        ...prop,
        options: (prop.options || []).filter((o) => o.id !== optId),
      },
    });
  };

  const colorMap: Record<string, string> = {
    red: '#fee2e2', orange: '#ffedd5', yellow: '#fef9c3', green: '#dcfce7',
    blue: '#dbeafe', purple: '#f3e8ff', pink: '#fce7f3', gray: '#f3f4f6',
  };

  const colorTextMap: Record<string, string> = {
    red: '#991b1b', orange: '#9a3412', yellow: '#854d0e', green: '#166534',
    blue: '#1e40af', purple: '#6b21a8', pink: '#9d174d', gray: '#374151',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Properties</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Existing properties */}
          {sortedProps.map(([id, prop]) => (
            <div key={id} className="prop-item">
              <div className="prop-item-header">
                <span className="prop-item-name">{prop.name}</span>
                <span className="prop-item-type">{prop.type}</span>
                <button
                  className="prop-item-remove"
                  onClick={() => handleRemoveProperty(id)}
                >
                  ×
                </button>
              </div>

              {/* Options for select/multi_select */}
              {(prop.type === 'select' || prop.type === 'multi_select') && (
                <div className="prop-options">
                  {(prop.options || []).map((opt) => (
                    <div key={opt.id} className="prop-option">
                      <span
                        className="select-tag"
                        style={{
                          background: colorMap[opt.color] || colorMap.gray,
                          color: colorTextMap[opt.color] || colorTextMap.gray,
                        }}
                      >
                        {opt.name}
                      </span>
                      <button
                        className="prop-option-remove"
                        onClick={() => handleRemoveOption(id, opt.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    className="prop-add-option-btn"
                    onClick={() => handleAddOption(id)}
                  >
                    + Add option
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add new property */}
          <div className="prop-add-form">
            <input
              className="prop-add-input"
              placeholder="Property name"
              value={newPropName}
              onChange={(e) => setNewPropName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddProperty();
              }}
            />
            <select
              className="prop-add-select"
              value={newPropType}
              onChange={(e) => setNewPropType(e.target.value as PropertyType)}
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <button className="prop-add-btn" onClick={handleAddProperty}>
              Add
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={() => onSave(props)}>
            Save Properties
          </button>
        </div>
      </div>
    </div>
  );
}
