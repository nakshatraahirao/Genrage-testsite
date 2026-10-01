import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminLayout } from './components/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { AdminCustomersPage } from './pages/AdminCustomersPage';
import { AdminCategoriesPage } from './pages/AdminCategoriesPage';

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-xs uppercase tracking-widest text-gray-500 animate-pulse">
        Verifying admin session...
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AdminAppRoutes: React.FC = () => {
  const { admin } = useAdminAuth();

  return (
    <Routes>
      <Route path="/login" element={admin ? <Navigate to="/dashboard" replace /> : <AdminLoginPage />} />
      
      <Route
        path="/"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminAppRoutes />
    </AdminAuthProvider>
  );
};

export default App;
