import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/deo/Dashboard';
import ProtectedRoute from './ProtectedRoute';

const DEORoutes = () => {
  const allowedRoles = ['deo'];

  return (
    <Routes>
      <Route
        path="dashboard"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/deo/dashboard" replace />} />
    </Routes>
  );
};

export default DEORoutes;
