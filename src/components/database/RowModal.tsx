import { useCallback, useEffect, useRef, useState } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useAuth } from '@/contexts/AuthContext';
import { updateItem } from '@/services/items';
import type { Item, PropertyDefinition, PropertyValue } from '@/types';
import CellRenderer from './cells/CellRenderer';

interface RowModalProps {
  row: Item;
  properties: Record<string, PropertyDefinition>;
  onClose: () => void;
}

export default function RowModal({ row, properties, onClose }: RowModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(row.title);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sortedProps = Object.entries(properties).sort(([, a], [, b]) => a.order - b.order);

  const editor = useCreateBlockNote({
    initialContent: row.content && Array.isArray(row.content) && row.content.length > 0
      ? row.content
      : undefined,
  });

  const saveContent = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (content: any) => {
      if (!user) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateItem(user.uid, row.id, { content });
      }, 1500);
    },
    [user, row.id]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!user) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateItem(user.uid, row.id, { title: newTitle });
    }, 800);
  };

  const handlePropertyChange = async (propId: string, value: PropertyValue) => {
    if (!user) return;
    const updatedValues = { ...(row.propertyValues || {}), [propId]: value };
    await updateItem(user.uid, row.id, { propertyValues: updatedValues });
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <input
            className="row-modal-title"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled"
          />
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Properties Grid */}
        <div className="row-modal-props">
          {sortedProps.map(([propId, prop]) => (
            <div key={propId} className="row-modal-prop">
              <span className="row-modal-prop-label">{prop.name}</span>
              <div className="row-modal-prop-value">
                <CellRenderer
                  property={prop}
                  value={row.propertyValues?.[propId] ?? null}
                  onChange={(val) => handlePropertyChange(propId, val)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="row-modal-divider" />

        {/* BlockNote Editor */}
        <div className="row-modal-editor">
          <BlockNoteView
            editor={editor}
            onChange={() => saveContent(editor.document)}
            theme="light"
          />
        </div>
      </div>
    </div>
  );
}
