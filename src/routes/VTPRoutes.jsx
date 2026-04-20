import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/vtp/Dashboard';
import MyCourses from '../pages/vtp/MyCourses';
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
        path="my-courses" 
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <MyCourses />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/vtp/dashboard" replace />} />
    </Routes>
  );
};

export default VTPRoutes;
