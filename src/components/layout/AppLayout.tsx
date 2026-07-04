import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
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

        <div className="sidebar-content">
          <p className="sidebar-placeholder">
            Pages and databases will appear here.
          </p>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
