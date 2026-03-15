import { BrowserRouter, Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './lib/hooks/use-auth';
import { Toaster } from 'sonner';

// Layouts
import MainLayout from './components/layout/main-layout';
import AuthLayout from './components/layout/auth-layout';

// Pages
import LoginPage from './pages/auth/login';
import RegisterPage from './pages/auth/register';
import DashboardPage from './pages/dashboard';
import CustomersPage from './pages/customers/index';
import CreateCustomerPage from './pages/customers/create';
import EditCustomerPage from './pages/customers/[id]';
import CalculatePage from './pages/transactions/calculate';
import TransactionsPage from './pages/transactions/index';
import DailyReportPage from './pages/reports/daily';
import WeeklyReportPage from './pages/reports/weekly';
import ProfilePage from './pages/settings/profile';
import ConfigurationPage from './pages/settings/configuration';
import ChangePasswordPage from './pages/settings/change-password';
import { Button } from './components/ui/button';

function App() {
  const { isLoading, loadUser } = useAuth();

  useEffect(() => {
    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Customers */}
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/create" element={<CreateCustomerPage />} />
            <Route path="/customers/:id" element={<EditCustomerPage />} />
            
            {/* Transactions */}
            <Route path="/calculate" element={<CalculatePage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            
            {/* Reports */}
            <Route path="/reports/daily" element={<DailyReportPage />} />
            <Route path="/reports/weekly" element={<WeeklyReportPage />} />
            
            {/* Settings */}
            <Route path="/settings" element={<Navigate to="/settings/profile" />} />
            <Route path="/settings/profile" element={<ProfilePage />} />
            <Route path="/settings/configuration" element={<ConfigurationPage />} />
            <Route path="/settings/change-password" element={<ChangePasswordPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

// Protected Route Component
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// 404 Page
function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Button asChild className="mt-4">
        <Link to="/">Go Home</Link>
      </Button>
    </div>
  );
}

export default App;