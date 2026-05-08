import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/vtp/Dashboard';
import VtApprovals from '../pages/vtp/VtApprovals';
import LeaveManagement from '../pages/vtp/LeaveManagement';
import ProtectedRoute from './ProtectedRoute';

const VTPRoutes = () => {
  const allowedRoles = ['vtp', 'vocational_teacher_provider'];

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
        path="vt-approvals"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <VtApprovals />
          </ProtectedRoute>
        }
      />
      <Route
        path="leave-management"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <LeaveManagement />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/vtp/dashboard" replace />} />
    </Routes>
  );
};

export default VTPRoutes;
