import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Keyboard shortcut to toggle sidebar: Cmd+\ or Ctrl+\
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`app-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      {isCollapsed && (
        <button
          className="sidebar-expand-btn"
          onClick={() => setIsCollapsed(false)}
          title="Show sidebar (Cmd+\)"
        >
          ⟫
        </button>
      )}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
