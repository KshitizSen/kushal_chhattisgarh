import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import AdminRoutes from './AdminRoutes';
import VTPRoutes from './VTPRoutes';
import PrincipalRoutes from './PrincipalRoutes';
import ProtectedRoute from './ProtectedRoute';
import useAuthStore from '../store/authStore';

const AppRouter = () => {
  const { isAuthenticated, role, initialized } = useAuthStore();

  // Don't render routes until store is hydrated from localStorage
  if (!initialized) return null;

  return (
    <Router>
      <Routes>
        {/* Public Routes – redirect to dashboard if already logged in */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={`/${role}/dashboard`} replace /> : <Login />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to={role ? `/${role}/dashboard` : '/login'} replace />} />
          <Route path="admin/*" element={<AdminRoutes />} />
          <Route path="vtp/*" element={<VTPRoutes />} />
          <Route path="principal/*" element={<PrincipalRoutes />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
