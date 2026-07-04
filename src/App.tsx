import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import LoginPage from '@/components/auth/LoginPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import PageEditor from '@/components/page/PageEditor';
import DatabaseView from '@/components/database/DatabaseView';

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

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <ToastProvider>
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
              <Route path="db/:itemId" element={<DatabaseView />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
