import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useItems } from '@/hooks/useItems';
import { createItem } from '@/services/items';
import SidebarItem from './SidebarItem';

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const { items, loading } = useItems();
  const navigate = useNavigate();

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

  return (
    <aside className="sidebar">
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

      {/* Items List */}
      <div className="sidebar-content">
        {loading ? (
          <div className="sidebar-loading">
            <div className="sidebar-skeleton" />
            <div className="sidebar-skeleton" />
            <div className="sidebar-skeleton" />
          </div>
        ) : items.length === 0 ? (
          <p className="sidebar-placeholder">
            No pages yet. Create one to get started!
          </p>
        ) : (
          <div className="sidebar-items">
            {items.map((item) => (
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
