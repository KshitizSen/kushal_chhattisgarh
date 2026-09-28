import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/vtp/Dashboard';
import VtStaffList from '../pages/vtp/VtStaffList';
import VocationalTrainingRequests from '../pages/common/VocationalTrainingRequests';
import MonthlyAttendanceReports from '../pages/vtp/MonthlyAttendanceReports';
import ProtectedRoute from './ProtectedRoute';
import SchoolsList from '../pages/vtp/SchoolsList';
import TradesList from '../pages/vtp/TradesList';
import AttendanceStatus from '../pages/vtp/AttendanceStatus';

const VTPRoutes = () => {
  const allowedRoles = ['vtp', 'vocational_teacher_provider'];

  return (
    <Routes>
      <Route
        path="dashboard"
        element={<ProtectedRoute allowedRoles={allowedRoles}><Dashboard /></ProtectedRoute>}
      />
      <Route path="attendance-status" element={<ProtectedRoute allowedRoles={allowedRoles}><AttendanceStatus /></ProtectedRoute>} />
      <Route
        path="vt-approvals"
        element={<Navigate to="/vtp/vocational-training-requests" replace />}
      />
      <Route
        path="leave-management"
        element={<Navigate to="/vtp/vocational-training-requests?tab=leave" replace />}
      />
      <Route
        path="vocational-training-requests"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <VocationalTrainingRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="vt-list"
        element={<ProtectedRoute allowedRoles={allowedRoles}><VtStaffList /></ProtectedRoute>}
      />
      <Route path="schools" element={<ProtectedRoute allowedRoles={allowedRoles}><SchoolsList /></ProtectedRoute>} />
      <Route path="trades" element={<ProtectedRoute allowedRoles={allowedRoles}><TradesList /></ProtectedRoute>} />
      <Route
        path="attendance-requests"
        element={<Navigate to="/vtp/vocational-training-requests" replace />}
      />
      <Route
        path="device-change-requests"
        element={<Navigate to="/vtp/vocational-training-requests" replace />}
      />
      <Route
        path="monthly-reports"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <MonthlyAttendanceReports />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/vtp/dashboard" replace />} />
    </Routes>
  );
};

export default VTPRoutes;
