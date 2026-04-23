import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/vtp/Dashboard';
import VTDetails from '../pages/vtp/VTDetails';
import ManageHolidays from '../pages/vtp/ManageHolidays';
import VTNotifications from '../pages/vtp/VTNotifications';
import ProtectedRoute from './ProtectedRoute';

const VTPRoutes = () => {
  const allowedRoles = ['vtp'];

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
      <Route
        path="vt-details"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <VTDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="manage-holidays"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <ManageHolidays />
          </ProtectedRoute>
        }
      />
      <Route
        path="notifications"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <VTNotifications />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/vtp/dashboard" replace />} />
    </Routes>
  );
};

export default VTPRoutes;
