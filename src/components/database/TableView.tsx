import { useAuth } from '@/contexts/AuthContext';
import { createItem, updateItem, archiveItem } from '@/services/items';
import type { Item, PropertyValue } from '@/types';
import CellRenderer from './cells/CellRenderer';

interface TableViewProps {
  database: Item;
  rows: Item[];
  onRowClick: (rowId: string) => void;
}

export default function TableView({ database, rows, onRowClick }: TableViewProps) {
  const { user } = useAuth();
  const properties = database.properties || {};
  const sortedProps = Object.entries(properties).sort(([, a], [, b]) => a.order - b.order);

  const handleAddRow = async () => {
    if (!user) return;
    await createItem(user.uid, 'page', database.id);
  };

  const handleCellChange = async (
    row: Item,
    propId: string,
    value: PropertyValue
  ) => {
    if (!user) return;
    const updatedValues = { ...(row.propertyValues || {}), [propId]: value };
    await updateItem(user.uid, row.id, { propertyValues: updatedValues });
  };

  const handleTitleChange = async (row: Item, newTitle: string) => {
    if (!user) return;
    await updateItem(user.uid, row.id, { title: newTitle });
  };

  const handleDeleteRow = async (e: React.MouseEvent, rowId: string) => {
    e.stopPropagation();
    if (!user) return;
    await archiveItem(user.uid, rowId);
  };

  return (
    <div className="table-wrapper">
      <div className="table-container">
        <table className="db-table">
          <thead>
            <tr>
              <th className="table-th table-th-title">Title</th>
              {sortedProps.map(([id, prop]) => (
                <th key={id} className="table-th">
                  {prop.name}
                </th>
              ))}
              <th className="table-th table-th-actions"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="table-row">
                <td className="table-td table-td-title">
                  <TitleCell
                    value={row.title}
                    onChange={(val) => handleTitleChange(row, val)}
                    onClick={() => onRowClick(row.id)}
                  />
                </td>
                {sortedProps.map(([propId, prop]) => (
                  <td key={propId} className="table-td">
                    <CellRenderer
                      property={prop}
                      value={row.propertyValues?.[propId] ?? null}
                      onChange={(val) => handleCellChange(row, propId, val)}
                    />
                  </td>
                ))}
                <td className="table-td table-td-actions">
                  <button
                    className="table-row-delete"
                    onClick={(e) => handleDeleteRow(e, row.id)}
                    title="Delete row"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Row */}
      <button className="table-add-row" onClick={handleAddRow}>
        + New row
      </button>
    </div>
  );
}

// ─── Title Cell (inline) ───

function TitleCell({
  value,
  onChange,
  onClick,
}: {
  value: string;
  onChange: (val: string) => void;
  onClick: () => void;
}) {
  return (
    <div className="title-cell">
      <span className="title-cell-open" onClick={onClick} title="Open as page">
        ↗
      </span>
      <input
        className="title-cell-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Untitled"
      />
    </div>
  );
}
