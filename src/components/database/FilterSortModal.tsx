import { useState } from 'react';
import type { PropertyDefinition, FilterRule, SortRule } from '@/types';

interface FilterSortModalProps {
  properties: Record<string, PropertyDefinition>;
  filters: FilterRule[];
  sortBy: SortRule[];
  onSave: (filters: FilterRule[], sortBy: SortRule[]) => void;
  onClose: () => void;
}

const OPERATORS = [
  { value: 'equals', label: 'is equal to' },
  { value: 'not_equals', label: 'is not equal to' },
  { value: 'contains', label: 'contains' },
  { value: 'gt', label: 'is greater than' },
  { value: 'lt', label: 'is less than' },
  { value: 'is_empty', label: 'is empty' },
  { value: 'is_not_empty', label: 'is not empty' },
];

export default function FilterSortModal({
  properties,
  filters,
  sortBy,
  onSave,
  onClose,
}: FilterSortModalProps) {
  const [filterList, setFilterList] = useState<FilterRule[]>([...filters]);
  const [sortList, setSortList] = useState<SortRule[]>([...sortBy]);

  const availableProps = [
    { id: 'title', name: 'Title', type: 'text' },
    ...Object.entries(properties).map(([id, p]) => ({ id, name: p.name, type: p.type })),
  ];

  const handleAddFilter = () => {
    if (availableProps.length === 0) return;
    const defaultProp = availableProps[0].id;
    const newFilter: FilterRule = {
      propertyId: defaultProp,
      operator: 'equals',
      value: '',
    };
    setFilterList([...filterList, newFilter]);
  };

  const handleUpdateFilter = (index: number, key: keyof FilterRule, val: unknown) => {
    const list = [...filterList];
    list[index] = { ...list[index], [key]: val };
    setFilterList(list);
  };

  const handleRemoveFilter = (index: number) => {
    setFilterList(filterList.filter((_, i) => i !== index));
  };

  const handleAddSort = () => {
    if (availableProps.length === 0) return;
    const defaultProp = availableProps[0].id;
    const newSort: SortRule = {
      propertyId: defaultProp,
      direction: 'asc',
    };
    setSortList([...sortList, newSort]);
  };

  const handleUpdateSort = (index: number, key: keyof SortRule, val: unknown) => {
    const list = [...sortList];
    list[index] = { ...list[index], [key]: val };
    setSortList(list);
  };

  const handleRemoveSort = (index: number) => {
    setSortList(sortList.filter((_, i) => i !== index));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Configure Filters & Sorts</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Filters Section */}
          <div className="filter-sort-section">
            <h4 className="section-title">Filters</h4>
            {filterList.length === 0 ? (
              <p className="no-rules-text">No active filters. This view shows all rows.</p>
            ) : (
              <div className="rules-list">
                {filterList.map((filter, index) => (
                  <div key={index} className="rule-row">
                    <select
                      className="rule-select"
                      value={filter.propertyId}
                      onChange={(e) => handleUpdateFilter(index, 'propertyId', e.target.value)}
                    >
                      {availableProps.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <select
                      className="rule-select"
                      value={filter.operator}
                      onChange={(e) => handleUpdateFilter(index, 'operator', e.target.value)}
                    >
                      {OPERATORS.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>

                    {filter.operator !== 'is_empty' && filter.operator !== 'is_not_empty' && (
                      <input
                        className="rule-input"
                        placeholder="Value..."
                        value={String(filter.value ?? '')}
                        onChange={(e) => handleUpdateFilter(index, 'value', e.target.value)}
                      />
                    )}

                    <button
                      className="rule-remove"
                      onClick={() => handleRemoveFilter(index)}
                      title="Remove Filter"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button className="add-rule-btn" onClick={handleAddFilter}>
              + Add Filter
            </button>
          </div>

          <div className="filter-sort-divider" />

          {/* Sort Section */}
          <div className="filter-sort-section">
            <h4 className="section-title">Sorting</h4>
            {sortList.length === 0 ? (
              <p className="no-rules-text">No active sort rules. Rows are sorted by manual drag order.</p>
            ) : (
              <div className="rules-list">
                {sortList.map((sort, index) => (
                  <div key={index} className="rule-row">
                    <select
                      className="rule-select"
                      value={sort.propertyId}
                      onChange={(e) => handleUpdateSort(index, 'propertyId', e.target.value)}
                    >
                      {availableProps.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <select
                      className="rule-select"
                      value={sort.direction}
                      onChange={(e) => handleUpdateSort(index, 'direction', e.target.value)}
                    >
                      <option value="asc">Ascending (A → Z)</option>
                      <option value="desc">Descending (Z → A)</option>
                    </select>

                    <button
                      className="rule-remove"
                      onClick={() => handleRemoveSort(index)}
                      title="Remove Sort"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button className="add-rule-btn" onClick={handleAddSort}>
              + Add Sort
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() => onSave(filterList, sortList)}
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  );
}
