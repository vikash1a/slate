import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import LoginPage from '@/components/auth/LoginPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import PageEditor from '@/components/page/PageEditor';
import DatabaseView from '@/components/database/DatabaseView';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { createSampleData } from '@/utils/sampleData';

function WelcomePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loadingSample, setLoadingSample] = useState(false);

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

  return (
    <div className="welcome-page">
      <div className="welcome-icon">📝</div>
      <h2 className="welcome-title">Welcome to Slate</h2>
      <p className="welcome-subtitle">
        Create a page or database from the sidebar to get started.
      </p>
      <button
        className="btn-primary"
        style={{ marginTop: '20px' }}
        onClick={handleLoadSample}
        disabled={loadingSample}
      >
        {loadingSample ? 'Loading...' : '⚡ Load Sample Data'}
      </button>
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
