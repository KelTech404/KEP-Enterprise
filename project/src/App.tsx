import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { AmbassadorLoginPage } from './pages/AmbassadorLoginPage';
import { AmbassadorPortalPage } from './pages/AmbassadorPortalPage';
import { AmbassadorReportPage } from './pages/AmbassadorReportPage';
import { DashboardPage } from './pages/DashboardPage';
import { HomePage } from './pages/HomePage';

function ProtectedRoute({ children, requireAmbassador = false }: { children: React.ReactNode; requireAmbassador?: boolean }) {
  const { user, loading, isAmbassador } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAmbassador && !isAmbassador) {
    return <Navigate to="/ambassador-login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Homepage */}
      <Route path="/" element={<HomePage />} />

      {/* Ambassador Login */}
      <Route path="/ambassador-login" element={<AmbassadorLoginPage />} />

      {/* Ambassador Portal */}
      <Route
        path="/ambassador-portal"
        element={
          <ProtectedRoute requireAmbassador={true}>
            <AmbassadorPortalPage />
          </ProtectedRoute>
        }
      />

      {/* Ambassador Report Submission */}
      <Route
        path="/ambassador-report"
        element={
          <ProtectedRoute requireAmbassador={true}>
            <AmbassadorReportPage />
          </ProtectedRoute>
        }
      />

      {/* Staff Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Staff Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
