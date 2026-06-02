import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Admissions from './pages/Admissions';
import CutoffAnalysis from './pages/CutoffAnalysis';
import Documents from './pages/Documents';
import Users from './pages/Users';
import Settings from './pages/Settings';

const Reports = lazy(() => import('./pages/Reports'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-text-muted text-sm">Loading…</div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/students/:id" element={<Students />} />
        <Route path="/admissions" element={<Admissions />} />
        <Route path="/cutoff" element={<CutoffAnalysis />} />
        <Route path="/documents" element={<Documents />} />
        <Route
          path="/reports"
          element={
            <Suspense fallback={<PageFallback />}>
              <Reports />
            </Suspense>
          }
        />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#0F172A',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.12)',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#7C3AED', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
