import { useNavigate, useParams } from 'react-router-dom';
import type { Item } from '@/types';
import { archiveItem } from '@/services/items';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

interface SidebarItemProps {
  item: Item;
}

export default function SidebarItem({ item }: SidebarItemProps) {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const isActive = itemId === item.id;

  const handleClick = () => {
    if (item.type === 'database') {
      navigate(`/db/${item.id}`);
    } else {
      navigate(`/page/${item.id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    await archiveItem(user.uid, item.id);
    if (isActive) {
      navigate('/');
    }
  };

  return (
    <div
      className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <span className="sidebar-item-icon">{item.icon}</span>
      <span className="sidebar-item-title">{item.title || 'Untitled'}</span>

      {item.type === 'database' && (
        <span className="sidebar-item-badge">DB</span>
      )}

      {showActions && (
        <button
          className="sidebar-item-delete"
          onClick={handleDelete}
          title="Delete"
        >
          ×
        </button>
      )}
    </div>
  );
}
