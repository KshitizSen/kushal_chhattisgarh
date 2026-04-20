import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, isAuthenticated, allowedRoles = [] }) => {
  const location = useLocation();
  const auth = useAuth();
  const authenticated = isAuthenticated ?? auth.isAuthenticated;
  const { role } = auth;

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
