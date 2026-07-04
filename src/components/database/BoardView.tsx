import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createItem, updateItem } from '@/services/items';
import type { Item, PropertyDefinition, PropertyValue, SelectOption } from '@/types';

interface BoardViewProps {
  database: Item;
  rows: Item[];
  onRowClick: (rowId: string) => void;
  groupByPropId: string; // The select property ID used to group
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

export default function BoardView({ database, rows, onRowClick, groupByPropId }: BoardViewProps) {
  const { user } = useAuth();
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);

  const properties = database.properties || {};
  const groupProperty = properties[groupByPropId];

  if (!groupProperty || (groupProperty.type !== 'select' && groupProperty.type !== 'multi_select')) {
    return (
      <div className="board-error">
        Please group by a "Select" or "Multi Select" property to display the board.
      </div>
    );
  }

  const columns = groupProperty.options || [];

  // Group rows by option name
  const rowsByColumn: Record<string, Item[]> = {
    unassigned: [],
  };
  columns.forEach((col) => {
    rowsByColumn[col.name] = [];
  });

  rows.forEach((row) => {
    const val = row.propertyValues?.[groupByPropId];
    if (typeof val === 'string' && val in rowsByColumn) {
      rowsByColumn[val].push(row);
    } else if (Array.isArray(val) && val.length > 0) {
      // For multi-select, put in the first selected category
      const firstVal = val[0];
      if (firstVal in rowsByColumn) {
        rowsByColumn[firstVal].push(row);
      } else {
        rowsByColumn.unassigned.push(row);
      }
    } else {
      rowsByColumn.unassigned.push(row);
    }
  });

  const handleAddCard = async (colName: string) => {
    if (!user) return;
    const propertyValues = {
      [groupByPropId]: colName === 'unassigned' ? '' : colName,
    };
    await createItem(user.uid, 'page', database.id);
    // Find the latest created item and update it, or we let client service set it.
    // Wait, createItem creates a blank page. The user can open it to set it,
    // but we can create it and immediately assign the value.
    // Since createItem returns the ID, we can do it:
    const id = await createItem(user.uid, 'page', database.id);
    await updateItem(user.uid, id, { propertyValues });
  };

  const handleDragStart = (rowId: string) => {
    setDraggedRowId(rowId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (colName: string) => {
    if (!user || !draggedRowId) return;

    const row = rows.find((r) => r.id === draggedRowId);
    if (!row) return;

    const currentValues = row.propertyValues || {};
    const updatedValues = {
      ...currentValues,
      [groupByPropId]: colName === 'unassigned' ? '' : colName,
    };

    await updateItem(user.uid, draggedRowId, { propertyValues: updatedValues });
    setDraggedRowId(null);
  };

  return (
    <div className="board-wrapper">
      <div className="board-columns">
        {/* Unassigned column */}
        <div
          className="board-column"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop('unassigned')}
        >
          <div className="board-column-header">
            <span className="board-column-title">Unassigned</span>
            <span className="board-column-count">{rowsByColumn.unassigned.length}</span>
          </div>
          <div className="board-cards">
            {rowsByColumn.unassigned.map((row) => (
              <BoardCard
                key={row.id}
                row={row}
                properties={properties}
                groupByPropId={groupByPropId}
                onClick={() => onRowClick(row.id)}
                onDragStart={() => handleDragStart(row.id)}
              />
            ))}
            <button
              className="board-add-card-btn"
              onClick={() => handleAddCard('unassigned')}
            >
              + Add card
            </button>
          </div>
        </div>

        {/* Option columns */}
        {columns.map((col) => (
          <div
            key={col.id}
            className="board-column"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(col.name)}
          >
            <div className="board-column-header">
              <span
                className="select-tag"
                style={{
                  background: colorMap[col.color] || colorMap.gray,
                  color: colorTextMap[col.color] || colorTextMap.gray,
                }}
              >
                {col.name}
              </span>
              <span className="board-column-count">
                {rowsByColumn[col.name]?.length || 0}
              </span>
            </div>
            <div className="board-cards">
              {(rowsByColumn[col.name] || []).map((row) => (
                <BoardCard
                  key={row.id}
                  row={row}
                  properties={properties}
                  groupByPropId={groupByPropId}
                  onClick={() => onRowClick(row.id)}
                  onDragStart={() => handleDragStart(row.id)}
                />
              ))}
              <button
                className="board-add-card-btn"
                onClick={() => handleAddCard(col.name)}
              >
                + Add card
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Board Card Component ───

interface BoardCardProps {
  row: Item;
  properties: Record<string, PropertyDefinition>;
  groupByPropId: string;
  onClick: () => void;
  onDragStart: () => void;
}

function BoardCard({ row, properties, groupByPropId, onClick, onDragStart }: BoardCardProps) {
  // Get other visible properties to show on the card
  const visibleProps = Object.entries(properties).filter(
    ([id, prop]) => id !== groupByPropId && row.propertyValues?.[id] != null
  );

  return (
    <div
      className="board-card"
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
    >
      <div className="board-card-title">{row.title || 'Untitled'}</div>
      {visibleProps.length > 0 && (
        <div className="board-card-props">
          {visibleProps.map(([id, prop]) => {
            const val = row.propertyValues?.[id];
            return (
              <div key={id} className="board-card-prop">
                <span className="board-card-prop-name">{prop.name}:</span>
                <span className="board-card-prop-value">{renderCardPropVal(prop, val)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function renderCardPropVal(prop: PropertyDefinition, value: PropertyValue): string {
  if (value == null) return '';
  if (prop.type === 'checkbox') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toLocaleDateString();
  }
  return String(value);
}
