import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useItem } from '@/hooks/useItem';
import { useDatabaseRows } from '@/hooks/useDatabaseRows';
import { updateItem } from '@/services/items';
import type { PropertyDefinition } from '@/types';
import TableView from './TableView';
import RowModal from './RowModal';
import PropertyEditor from './PropertyEditor';

export default function DatabaseView() {
  const { itemId } = useParams<{ itemId: string }>();
  const { user } = useAuth();
  const { item: database, loading: dbLoading } = useItem(itemId);
  const { rows, loading: rowsLoading } = useDatabaseRows(itemId);
  const [showPropertyEditor, setShowPropertyEditor] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [titleInitialized, setTitleInitialized] = useState(false);

  // Sync title from database
  if (database && !titleInitialized) {
    setTitle(database.title);
    setTitleInitialized(true);
  }

  // Reset when itemId changes
  if (database && database.id !== itemId) {
    setTitleInitialized(false);
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!user || !itemId) return;
    updateItem(user.uid, itemId, { title: newTitle });
  };

  const handleSaveProperties = async (properties: Record<string, PropertyDefinition>) => {
    if (!user || !itemId) return;
    await updateItem(user.uid, itemId, { properties });
    setShowPropertyEditor(false);
  };

  const selectedRow = selectedRowId ? rows.find((r) => r.id === selectedRowId) : null;

  if (dbLoading || rowsLoading) {
    return (
      <div className="page-editor-loading">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line short" />
      </div>
    );
  }

  if (!database) {
    return (
      <div className="page-editor-empty">
        <p>Database not found.</p>
      </div>
    );
  }

  const hasProperties = Object.keys(database.properties || {}).length > 0;

  return (
    <div className="database-view">
      {/* Header */}
      <div className="database-header">
        <span className="database-icon">{database.icon}</span>
        <input
          className="database-title"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Database"
        />
      </div>

      {/* Toolbar */}
      <div className="database-toolbar">
        <button
          className="toolbar-btn"
          onClick={() => setShowPropertyEditor(true)}
        >
          ⚙ Properties
        </button>
        <span className="toolbar-info">
          {rows.length} {rows.length === 1 ? 'row' : 'rows'}
        </span>
      </div>

      {/* Table or Empty State */}
      {hasProperties ? (
        <TableView
          database={database}
          rows={rows}
          onRowClick={(rowId) => setSelectedRowId(rowId)}
        />
      ) : (
        <div className="database-empty">
          <p className="database-empty-text">
            No properties defined yet. Add properties to build your database.
          </p>
          <button
            className="btn-primary"
            onClick={() => setShowPropertyEditor(true)}
          >
            + Add Properties
          </button>
        </div>
      )}

      {/* Property Editor Modal */}
      {showPropertyEditor && (
        <PropertyEditor
          properties={database.properties || {}}
          onSave={handleSaveProperties}
          onClose={() => setShowPropertyEditor(false)}
        />
      )}

      {/* Row Modal */}
      {selectedRow && (
        <RowModal
          row={selectedRow}
          properties={database.properties || {}}
          onClose={() => setSelectedRowId(null)}
        />
      )}
    </div>
  );
}
