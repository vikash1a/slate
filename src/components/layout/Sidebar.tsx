import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useItems } from '@/hooks/useItems';
import { createItem } from '@/services/items';
import SidebarItem from './SidebarItem';
import { useToast } from '@/contexts/ToastContext';
import { createSampleData } from '@/utils/sampleData';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { items, loading } = useItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingSample, setLoadingSample] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd+Shift+N (New Page) and Cmd+Alt+N (New Database)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewPage();
      }
      if ((e.metaKey || e.ctrlKey) && e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewDatabase();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  const handleNewPage = async () => {
    if (!user) return;
    const id = await createItem(user.uid, 'page');
    navigate(`/page/${id}`);
  };

  const handleNewDatabase = async () => {
    if (!user) return;
    const id = await createItem(user.uid, 'database');
    navigate(`/db/${id}`);
  };

  const handleLoadSample = async () => {
    if (!user) return;
    setLoadingSample(true);
    try {
      await createSampleData(user.uid);
      showToast('Loaded sample welcome page and task board!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to load sample data', 'error');
    } finally {
      setLoadingSample(false);
    }
  };

  const filteredItems = items.filter((item) =>
    (item.title || 'Untitled').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg
            width="28"
            height="28"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              width="48"
              height="48"
              rx="12"
              fill="url(#sidebar-logo-gradient)"
            />
            <path
              d="M14 16h20v2H14zM14 22h16v2H14zM14 28h20v2H14zM14 34h12v2H14z"
              fill="white"
              opacity="0.9"
            />
            <defs>
              <linearGradient
                id="sidebar-logo-gradient"
                x1="0"
                y1="0"
                x2="48"
                y2="48"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <span className="sidebar-logo-text">Slate</span>
        </div>
        <button
          className="sidebar-collapse-btn"
          onClick={onToggle}
          title="Collapse sidebar (Cmd+\)"
        >
          ⪡
        </button>
      </div>

      {/* Actions */}
      <div className="sidebar-actions">
        <button className="sidebar-action-btn" onClick={handleNewPage}>
          <span className="sidebar-action-icon">+</span>
          <span>New Page</span>
        </button>
        <button className="sidebar-action-btn" onClick={handleNewDatabase}>
          <span className="sidebar-action-icon">◫</span>
          <span>New Database</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="sidebar-search">
        <input
          ref={searchInputRef}
          className="sidebar-search-input"
          placeholder="🔍 Search pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="sidebar-search-clear"
            onClick={() => setSearchQuery('')}
          >
            ×
          </button>
        )}
      </div>

      {/* Items List */}
      <div className="sidebar-content">
        {loading ? (
          <div className="sidebar-loading">
            <div className="sidebar-skeleton" />
            <div className="sidebar-skeleton" />
            <div className="sidebar-skeleton" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="sidebar-placeholder-container">
            <p className="sidebar-placeholder">
              {searchQuery ? 'No matching pages' : 'No pages yet.'}
            </p>
            {!searchQuery && (
              <button
                className="sidebar-sample-btn"
                onClick={handleLoadSample}
                disabled={loadingSample}
              >
                {loadingSample ? 'Loading...' : '⚡ Load Sample Data'}
              </button>
            )}
          </div>
        ) : (
          <div className="sidebar-items">
            {filteredItems.map((item) => (
              <SidebarItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="sidebar-user-avatar"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="sidebar-user-avatar-placeholder">
              {user?.displayName?.[0] || '?'}
            </div>
          )}
          <span className="sidebar-user-name">
            {user?.displayName || user?.email || 'User'}
          </span>
        </div>
        <button className="sidebar-signout-btn" onClick={signOut} title="Sign out">
          ↗
        </button>
      </div>
    </aside>
  );
}
