import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/principal/Dashboard';
import SchoolOverview from '../pages/principal/SchoolOverview';
import StaffManagement from '../pages/principal/StaffManagement';
import ProtectedRoute from './ProtectedRoute';

const PrincipalRoutes = () => {
  const allowedRoles = ['principal'];

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
        path="school-overview" 
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <SchoolOverview />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="staff-management" 
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <StaffManagement />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/principal/dashboard" replace />} />
    </Routes>
  );
};

export default PrincipalRoutes;
