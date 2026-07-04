import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import LoginPage from '@/components/auth/LoginPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import PageEditor from '@/components/page/PageEditor';

function WelcomePage() {
  return (
    <div className="welcome-page">
      <div className="welcome-icon">📝</div>
      <h2 className="welcome-title">Welcome to Slate</h2>
      <p className="welcome-subtitle">
        Create a page or database from the sidebar to get started.
      </p>
    </div>
  );
}

function DatabasePlaceholder() {
  return (
    <div className="welcome-page">
      <div className="welcome-icon">📊</div>
      <h2 className="welcome-title">Database View</h2>
      <p className="welcome-subtitle">
        Table and board views coming in Phase 3.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<WelcomePage />} />
            <Route path="page/:itemId" element={<PageEditor />} />
            <Route path="db/:itemId" element={<DatabasePlaceholder />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
