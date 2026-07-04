import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useItem } from '@/hooks/useItem';
import { updateItem } from '@/services/items';
import { useAuth } from '@/contexts/AuthContext';
import EmojiPicker from '@/components/shared/EmojiPicker';

export default function PageEditor() {
  const { itemId } = useParams<{ itemId: string }>();
  const { user } = useAuth();
  const { item, loading } = useItem(itemId);
  const [title, setTitle] = useState('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoadRef = useRef(true);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const editor = useCreateBlockNote({
    initialContent: undefined,
  });

  // Load content when item changes
  useEffect(() => {
    if (!item || !editor) return;

    if (isInitialLoadRef.current) {
      setTitle(item.title || '');

      if (item.content && Array.isArray(item.content) && item.content.length > 0) {
        editor.replaceBlocks(editor.document, item.content);
      }

      isInitialLoadRef.current = false;
    }
  }, [item, editor]);

  // Reset initial load flag when itemId changes
  useEffect(() => {
    isInitialLoadRef.current = true;
  }, [itemId]);

  // Auto-save with debounce
  const saveContent = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (contentToSave?: any) => {
      if (!user || !itemId) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const data: Record<string, unknown> = {};
        if (contentToSave !== undefined) {
          data.content = contentToSave;
        }
        if (Object.keys(data).length > 0) {
          updateItem(user.uid, itemId, data);
        }
      }, 1500);
    },
    [user, itemId]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    if (!user || !itemId) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      updateItem(user.uid, itemId, { title: newTitle });
    }, 800);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      editor?.focus('end');
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="page-editor-loading">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line short" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="page-editor-empty">
        <p>Page not found.</p>
      </div>
    );
  }

  return (
    <div className="page-editor">
      <div className="page-editor-header">
        <EmojiPicker
          currentIcon={item.icon}
          onSelect={(emoji) => {
            if (user) updateItem(user.uid, item.id, { icon: emoji });
          }}
        />
        <input
          ref={titleInputRef}
          className="page-editor-title"
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          spellCheck={false}
        />
      </div>

      <div className="page-editor-content">
        <BlockNoteView
          editor={editor}
          onChange={() => {
            saveContent(editor.document);
          }}
          theme="light"
        />
      </div>
    </div>
  );
}
