import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useItem } from '@/hooks/useItem';
import { useDatabaseRows } from '@/hooks/useDatabaseRows';
import { updateItem } from '@/services/items';
import type { PropertyDefinition, ViewDefinition, ViewType, FilterRule, SortRule } from '@/types';
import { applyFilterRules } from '@/utils/filters';
import { applySortRules } from '@/utils/sorting';
import TableView from './TableView';
import BoardView from './BoardView';
import RowModal from './RowModal';
import PropertyEditor from './PropertyEditor';
import FilterSortModal from './FilterSortModal';

export default function DatabaseView() {
  const { itemId } = useParams<{ itemId: string }>();
  const { user } = useAuth();
  const { item: database, loading: dbLoading } = useItem(itemId);
  const { rows, loading: rowsLoading } = useDatabaseRows(itemId);
  const [showPropertyEditor, setShowPropertyEditor] = useState(false);
  const [showFilterSortModal, setShowFilterSortModal] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [titleInitialized, setTitleInitialized] = useState(false);
  const [activeViewId, setActiveViewId] = useState<string>('');
  const [groupByPropId, setGroupByPropId] = useState<string>('');

  // Reset states when the route ID changes
  useEffect(() => {
    setTitle('');
    setTitleInitialized(false);
    setActiveViewId('');
    setGroupByPropId('');
  }, [itemId]);

  // Sync title from database when it loads
  useEffect(() => {
    if (database && !titleInitialized) {
      setTitle(database.title);
      setTitleInitialized(true);
    }
  }, [database, titleInitialized]);

  // Views initialization/handling
  const views = database?.views || {};
  const viewList = Object.entries(views).sort(([, a], [, b]) => a.order - b.order);

  useEffect(() => {
    if (!database) return;

    // If activeViewId is not set, set it to the first view, or create a default Table view
    if (!activeViewId) {
      if (viewList.length > 0) {
        setActiveViewId(viewList[0][0]);
      } else {
        // Create default Table view
        const defaultViewId = 'view_' + Math.random().toString(36).slice(2, 9);
        const defaultView: ViewDefinition = {
          name: 'Table View',
          type: 'table',
          visibleProperties: Object.keys(database.properties || {}),
          order: 0,
        };
        if (user && itemId) {
          updateItem(user.uid, itemId, {
            views: { [defaultViewId]: defaultView },
          });
          setActiveViewId(defaultViewId);
        }
      }
    }
  }, [database, activeViewId, viewList, user, itemId]);

  // Set default groupBy property when switching to a board view
  const activeView = views[activeViewId];
  useEffect(() => {
    if (!database || !activeView || activeView.type !== 'board') return;

    if (!groupByPropId) {
      // Find the first select property
      const selectProps = Object.entries(database.properties || {}).filter(
        ([, prop]) => prop.type === 'select' || prop.type === 'multi_select'
      );
      if (selectProps.length > 0) {
        setGroupByPropId(selectProps[0][0]);
      }
    }
  }, [database, activeView, groupByPropId]);

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

  const handleSaveFiltersAndSorts = async (filters: FilterRule[], sortBy: SortRule[]) => {
    if (!user || !itemId || !activeViewId || !database) return;
    const currentViews = database.views || {};
    const activeViewObj = currentViews[activeViewId];
    if (!activeViewObj) return;

    const updatedView = {
      ...activeViewObj,
      filters,
      sortBy,
    };
    const updatedViews = {
      ...currentViews,
      [activeViewId]: updatedView,
    };
    await updateItem(user.uid, itemId, { views: updatedViews });
    setShowFilterSortModal(false);
  };

  const handleAddView = async (type: ViewType) => {
    if (!user || !itemId || !database) return;
    const viewId = 'view_' + Math.random().toString(36).slice(2, 9);
    const newView: ViewDefinition = {
      name: type === 'table' ? 'Table View' : 'Board View',
      type,
      visibleProperties: Object.keys(database.properties || {}),
      order: Object.keys(views).length,
    };
    const updatedViews = { ...views, [viewId]: newView };
    await updateItem(user.uid, itemId, { views: updatedViews });
    setActiveViewId(viewId);
  };

  const handleDeleteView = async (viewIdToDelete: string) => {
    if (!user || !itemId || !database) return;
    const nextViews = { ...views };
    delete nextViews[viewIdToDelete];
    await updateItem(user.uid, itemId, { views: nextViews });
    // Reset active view
    const remaining = Object.keys(nextViews);
    if (remaining.length > 0) {
      setActiveViewId(remaining[0]);
    } else {
      setActiveViewId('');
    }
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
  const selectProperties = Object.entries(database.properties || {}).filter(
    ([, prop]) => prop.type === 'select' || prop.type === 'multi_select'
  );

  // Apply sorting and filtering
  const activeFilters = activeView?.filters || [];
  const activeSorts = activeView?.sortBy || [];
  const processedRows = applySortRules(applyFilterRules(rows, activeFilters), activeSorts);

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

      {/* Views Navigation */}
      <div className="database-views-bar">
        <div className="views-tabs">
          {viewList.map(([id, v]) => (
            <div
              key={id}
              className={`view-tab ${activeViewId === id ? 'active' : ''}`}
              onClick={() => setActiveViewId(id)}
            >
              <span>{v.type === 'table' ? '📋' : '🗂️'} {v.name}</span>
              {viewList.length > 1 && (
                <button
                  className="delete-view-tab"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteView(id);
                  }}
                  title="Delete View"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            className="add-view-tab"
            onClick={() => handleAddView('table')}
            title="Add Table View"
          >
            + Table
          </button>
          <button
            className="add-view-tab"
            onClick={() => handleAddView('board')}
            title="Add Board View"
          >
            + Board
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="database-toolbar">
        <button
          className="toolbar-btn"
          onClick={() => setShowPropertyEditor(true)}
        >
          ⚙ Properties
        </button>

        {hasProperties && (
          <button
            className="toolbar-btn"
            onClick={() => setShowFilterSortModal(true)}
          >
            👁️ Filter & Sort {activeFilters.length > 0 || activeSorts.length > 0 ? `(${activeFilters.length + activeSorts.length})` : ''}
          </button>
        )}

        {activeView?.type === 'board' && selectProperties.length > 0 && (
          <div className="toolbar-group-by">
            <span className="group-by-label">Group by:</span>
            <select
              className="group-by-select"
              value={groupByPropId}
              onChange={(e) => setGroupByPropId(e.target.value)}
            >
              {selectProperties.map(([id, prop]) => (
                <option key={id} value={id}>
                  {prop.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <span className="toolbar-info">
          {processedRows.length} {processedRows.length === 1 ? 'row' : 'rows'}
        </span>
      </div>

      {/* View Content or Empty State */}
      {!hasProperties ? (
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
      ) : activeView?.type === 'board' ? (
        selectProperties.length === 0 ? (
          <div className="database-empty">
            <p className="database-empty-text">
              Board view requires at least one **Select** or **Multi Select** property to group by.
            </p>
            <button
              className="btn-primary"
              onClick={() => setShowPropertyEditor(true)}
            >
              + Add Select Property
            </button>
          </div>
        ) : (
          <BoardView
            database={database}
            rows={processedRows}
            onRowClick={(rowId) => setSelectedRowId(rowId)}
            groupByPropId={groupByPropId}
          />
        )
      ) : (
        <TableView
          database={database}
          rows={processedRows}
          onRowClick={(rowId) => setSelectedRowId(rowId)}
        />
      )}

      {/* Property Editor Modal */}
      {showPropertyEditor && (
        <PropertyEditor
          properties={database.properties || {}}
          onSave={handleSaveProperties}
          onClose={() => setShowPropertyEditor(false)}
        />
      )}

      {/* Filter & Sort Config Modal */}
      {showFilterSortModal && (
        <FilterSortModal
          properties={database.properties || {}}
          filters={activeFilters}
          sortBy={activeSorts}
          onSave={handleSaveFiltersAndSorts}
          onClose={() => setShowFilterSortModal(false)}
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
