import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/admin/Dashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageSchools from '../pages/admin/ManageSchools';
import ManageVTP from '../pages/admin/ManageVTP';
import ManageDEO from '../pages/admin/ManageDEO';
import Reports from '../pages/admin/Reports';
import Settings from '../pages/admin/Settings';
import ManageRoles from '../pages/admin/ManageRoles';
import AttendanceTracking from '../pages/admin/AttendanceTracking';
import ProtectedRoute from './ProtectedRoute';

const AdminRoutes = () => {
  const allowedRoles = ['admin'];

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
        path="manage-users" 
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <ManageUsers />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="manage-schools" 
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <ManageSchools />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="manage-vtp" 
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <ManageVTP />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="manage-deo" 
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <ManageDEO />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="attendance-tracking" 
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <AttendanceTracking />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="roles" 
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <ManageRoles />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="reports" 
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <Reports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="settings/*" 
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
