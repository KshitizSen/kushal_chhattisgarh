import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, isAuthenticated, allowedRoles = [] }) => {
  const location = useLocation();
  const auth = useAuth();
  const authenticated = isAuthenticated ?? auth.isAuthenticated;
  const { initialized, role } = auth;

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-sm font-medium text-gray-500 dark:bg-gray-950 dark:text-gray-400">
        Loading session...
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
